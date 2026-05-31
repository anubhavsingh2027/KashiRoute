const jwt = require("jsonwebtoken");
const ChatBot = require("../models/chatbotModel");
const User = require("../models/UserModel");
const carDetails = require("../models/carDetailsModel");
const packageDetails = require("../models/packagedetailsModel");
const PackageBooking = require("../models/PackageBookingModel");
const CarBooking = require("../models/CarBookingModel");
const { groqcalling } = require("../utils/grok.utils");
const {
  chatbotQuery_login,
  chatbotQuery_notLogin,
  chatbotQuery_login_withIntent,
  chatbotQuery_notLogin_withIntent,
  detectLanguage,
  parseBookingLinks,
} = require("../utils/chatQuery");

/**
 * Helper function to fetch and format user's booking history
 * DATABASE OPERATION - Runs in controller only
 */
const getFormattedBookingHistory = async (userId) => {
  let bookingHistory = "";
  try {
    // Fetch package bookings
    const packageBookings = await PackageBooking.find({ userId })
      .select("packageName totalPrice arrivalDate guestNo request")
      .sort({ arrivalDate: -1 })
      .lean();

    // Fetch car bookings
    const carBookings = await CarBooking.find({ userId })
      .select("carName totalPrice date duration notes")
      .sort({ date: -1 })
      .lean();

    // Format booking history
    let packageBookingDetails = "";
    if (packageBookings && packageBookings.length > 0) {
      packageBookingDetails = packageBookings
        .map((booking) => {
          const arrivalDate = booking.arrivalDate
            ? new Date(booking.arrivalDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A";
          return `- ** Package Name :${booking.packageName}**, Total Price paid: ₹${booking.totalPrice}, Arrival: ${arrivalDate}, Guests: ${booking.guestNo}, Request: ${booking.request || "None"}`;
        })
        .join("\n");
    }

    // Format car booking history
    let carBookingDetails = "";
    if (carBookings && carBookings.length > 0) {
      carBookingDetails = carBookings
        .map((booking) => {
          const bookingDate = booking.date
            ? new Date(booking.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A";
          return `- ** Car Name :${booking.carName}**, Total Price paid : ₹${booking.totalPrice}, Date: ${bookingDate}, Duration: ${booking.duration} hrs, Notes: ${booking.notes || "None"}`;
        })
        .join("\n");
    }

    // Combine booking histories
    if (packageBookingDetails || carBookingDetails) {
      bookingHistory = "\nUser's Previous Bookings:";
      if (packageBookingDetails) {
        bookingHistory += `\n\n**Package Bookings:**\n${packageBookingDetails}`;
      }
      if (carBookingDetails) {
        bookingHistory += `\n\n**Car Bookings:**\n${carBookingDetails}`;
      }
    }
  } catch (error) {
    console.error("Error fetching booking history:", error);
  }

  return bookingHistory;
};

/**
 * POST /chatbot
 * Handle chatbot queries for both logged-in and non-logged-in users
 *
 * PHASE 1: LOGGED-IN USERS
 * - Uses JWT token for authentication
 * - Stores chats with userId
 * - Uses personalized user info (name, phone, email, location)
 * - Does NOT use session IDs
 *
 * PHASE 2: NON-LOGGED-IN USERS (GUESTS)
 * - Uses sessionId from cookiesf
 * - Stores chats with sessionId
 * - No personalized user info
 * - SessionId is persistent for 30 days
 */
exports.postChatbot = async (req, res) => {
  try {
    const { question } = req.body;

    // Validate input
    if (!question || question.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Question cannot be empty",
      });
    }

    const token = req.cookies.token;

    // ===== PHASE 1: LOGGED-IN USER (TOKEN EXISTS) =====
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.user._id) {
          const userId = decoded.user._id;
          // Clear any previous guest session cookie
          res.clearCookie("chatbotSessionId");

          // Fetch user details for personalized responses
          const userInfo = await User.findById(userId)
            .select("userName phone email location userType")
            .lean();

          // Fetch car and package details
          const cars = await carDetails
            .find()
            .select("carName totalSeats price description _id")
            .lean();

          const packages = await packageDetails
            .find()
            .select("packageName place packageDuration price description _id")
            .lean();

          // Fetch previous chat messages for logged-in user - Last 10 messages only (newest first, then reversed for display)
          let previousMessages = await ChatBot.find({
            userId,
            userMode: "login",
          })
            .select("question answer createdAt")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
          // Reverse to show chronologically (oldest to newest)
          previousMessages = previousMessages.reverse();

          // STEP 1: DETECT INTENT USING GROQ API
          const intentDetection = require("../utils/intentDetection");

          // Call Groq to detect intent (with conversation context)
          const detectedIntents = await intentDetection.detectIntents(
            question,
            previousMessages,
          );

          // CHECK IF SPECIAL INTENT - NEW_PACKAGE_IDEA or NEW_CAR_REQUIRED
          // (WITH VALIDATION TO PREVENT FALSE POSITIVES)
          const primaryIntent = detectedIntents[0];
          let isSpecialIntent = false;

          if (primaryIntent === "NEW_PACKAGE_IDEA") {
            // Validate that user is actually proposing, not just asking for recommendations
            isSpecialIntent = intentDetection.validateNewPackageIdea(question);
          } else if (primaryIntent === "NEW_CAR_REQUIRED") {
            // Validate that user is actually requesting new car, not just asking about cars
            isSpecialIntent = intentDetection.validateNewCarRequired(question);
          }

          if (isSpecialIntent) {
            // STEP 2-4: Use Groq to generate professional subject & description for contact form

            const chatQuery = require("../utils/chatQuery");
            const contactFormPrompt = chatQuery.buildContactFormPrompt(
              question,
              primaryIntent,
              userInfo,
            );

            // Call Groq to generate subject and description
            const groqResponse = await groqcalling(contactFormPrompt, question);

            // Parse the structured response
            const parsedData = chatQuery.parseContactFormResponse(groqResponse);

            // Generate contact form data for frontend
            const contactData = {
              subject: parsedData.subject,
              description: parsedData.description,
              userDetails: {
                name: userInfo?.userName,
                email: userInfo?.email,
                phone: userInfo?.phone,
              },
              originalQuestion: question,
              intentType: primaryIntent,
              aiGenerated: true,
            };

            // Save chat with action metadata
            const chatEntry = new ChatBot({
              userId: userId,
              sessionId: null,
              question,
              answer: `[ACTION: ${primaryIntent}] Contact form data generated`,
              userMode: "login",
              metadata: {
                intentType: primaryIntent,
                contactData: contactData,
                aiGeneratedResponse: groqResponse,
              },
            });
            await chatEntry.save();

            return res.status(200).json({
              status: true,
              message: "Request processed successfully",
              data: {
                response: `✅ Your ${primaryIntent === "NEW_PACKAGE_IDEA" ? "package idea" : "vehicle request"} has been prepared for contact form.\n\nCopy the details below and fill them on /contact page:\n\n📋 Subject: ${parsedData.subject}\n\n📝 Description: ${parsedData.description}`,
                action: {
                  type: primaryIntent,
                  contactData: contactData,
                  redirectTo: "/contact",
                },
                userMode: "login",
                sessionId: null,
                userId: userId,
              },
            });
          }

          // CHECK IF NOT_RELATED INTENT - Answer generic question without KashiRoute data
          if (primaryIntent === "NOT_RELATED") {
            const chatQuery = require("../utils/chatQuery");

            // Check if topic is dangerous/harmful
            if (chatQuery.isDangerousTopic(question)) {
              const dangerousResponse =
                "I can't help with that topic as it may be harmful or dangerous. Please ask me something else! 🙂";

              const chatEntry = new ChatBot({
                userId: userId,
                sessionId: null,
                question,
                answer: dangerousResponse,
                userMode: "login",
              });
              await chatEntry.save();

              return res.status(200).json({
                status: true,
                message: "Chat response generated successfully",
                data: {
                  response: dangerousResponse,
                  bookingLink: null,
                  userMode: "login",
                  sessionId: null,
                  userId: userId,
                },
              });
            }

            // Safe to answer - build generic prompt without KashiRoute data
            const genericPrompt = chatQuery.buildNotRelatedPrompt(question);
            const aiResponse = await groqcalling(genericPrompt, question);

            const chatEntry = new ChatBot({
              userId: userId,
              sessionId: null,
              question,
              answer: aiResponse,
              userMode: "login",
            });
            await chatEntry.save();

            return res.status(200).json({
              status: true,
              message: "Chat response generated successfully",
              data: {
                response: aiResponse,
                bookingLink: null,
                userMode: "login",
                sessionId: null,
                userId: userId,
              },
            });
          }

          const bookingHistory = await getFormattedBookingHistory(userId);

          const filteredData = await intentDetection.getFilteredContextByIntent(
            question,
            {
              cars: cars,
              packages: packages,
              userInfo: userInfo,
              bookingHistory: bookingHistory,
              previousMessages: previousMessages,
            },
          );

          // STEP 3: BUILD CLEAN PROMPT WITH ONLY INTENT DATA
          const buildCleanPrompt =
            require("../utils/chatQuery").buildCleanPrompt;
          const systemPrompt = buildCleanPrompt(
            question,
            filteredData,
            detectedIntents[0], // primary intent
          );

          const aiResponse = await groqcalling(systemPrompt, question);
          // Parse booking links from response
          const { cleanResponse, bookingLink } = parseBookingLinks(aiResponse);

          // Save chat to database with userId
          const chatEntry = new ChatBot({
            userId: userId,
            sessionId: null,
            question,
            answer: cleanResponse,
            userMode: "login",
          });
          await chatEntry.save();
          // Return response for logged-in user
          return res.status(200).json({
            status: true,
            message: "Chat response generated successfully",
            data: {
              response: cleanResponse,
              bookingLink: bookingLink,
              userMode: "login",
              sessionId: null,
              userId: userId,
            },
          });
        }
      } catch (error) {
        // Token verification failed, treat as guest
      }
    }

    // ===== PHASE 2: NON-LOGGED-IN USER (NO TOKEN) =====

    // Get or generate session ID
    let sessionId = req.cookies.chatbotSessionId;

    if (!sessionId) {
      // Generate new session ID
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    } else {
    }

    // Set session cookie for guest
    res.cookie("chatbotSessionId", sessionId, {
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: "lax",
    });

    // Fetch car and package details
    const cars = await carDetails
      .find()
      .select("_id carName totalSeats price description ")
      .lean();
    const packages = await packageDetails
      .find()
      .select("packageName place packageDuration price description _id")
      .lean();

    // Fetch previous chat messages for guest session - Last 10 messages only (newest first, then reversed for display)
    let previousMessages = await ChatBot.find({
      sessionId,
      userMode: "notLogin",
    })
      .select("question answer createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    // Reverse to show chronologically (oldest to newest)
    previousMessages = previousMessages.reverse();

    // STEP 1: DETECT INTENT USING GROQ API
    const intentDetection = require("../utils/intentDetection");

    // Call Groq to detect intent (with conversation context)
    const detectedIntents = await intentDetection.detectIntents(
      question,
      previousMessages,
    );

    // CHECK IF SPECIAL INTENT - NEW_PACKAGE_IDEA or NEW_CAR_REQUIRED
    // (WITH VALIDATION TO PREVENT FALSE POSITIVES)
    const primaryIntentGuest = detectedIntents[0];
    let isSpecialIntentGuest = false;

    if (primaryIntentGuest === "NEW_PACKAGE_IDEA") {
      // Validate that user is actually proposing, not just asking for recommendations
      isSpecialIntentGuest = intentDetection.validateNewPackageIdea(question);
    } else if (primaryIntentGuest === "NEW_CAR_REQUIRED") {
      // Validate that user is actually requesting new car, not just asking about cars
      isSpecialIntentGuest = intentDetection.validateNewCarRequired(question);
    }

    if (isSpecialIntentGuest) {
      // STEP 2-4: Use Groq to generate professional subject & description for contact form

      const chatQuery = require("../utils/chatQuery");
      const contactFormPrompt = chatQuery.buildContactFormPrompt(
        question,
        primaryIntentGuest,
        { sessionId: sessionId }, // Guest user info
      );

      // Call Groq to generate subject and description
      const groqResponse = await groqcalling(contactFormPrompt, question);

      // Parse the structured response
      const parsedData = chatQuery.parseContactFormResponse(groqResponse);

      // Generate contact form data for frontend
      const contactDataGuest = {
        subject: parsedData.subject,
        description: parsedData.description,
        sessionId: sessionId,
        originalQuestion: question,
        intentType: primaryIntentGuest,
        aiGenerated: true,
      };

      // Save chat with action metadata
      const chatEntryGuest = new ChatBot({
        userId: null,
        sessionId: sessionId,
        question,
        answer: `[ACTION: ${primaryIntentGuest}] Contact form data generated`,
        userMode: "notLogin",
        metadata: {
          intentType: primaryIntentGuest,
          contactData: contactDataGuest,
          aiGeneratedResponse: groqResponse,
        },
      });
      await chatEntryGuest.save();

      return res.status(200).json({
        status: true,
        message: "Request processed successfully",
        data: {
          response: `✅ Your ${primaryIntentGuest === "NEW_PACKAGE_IDEA" ? "package idea" : "vehicle request"} has been prepared for contact form.\n\nCopy the details below and fill them on /contact page:\n\n📋 Subject: ${parsedData.subject}\n\n📝 Description: ${parsedData.description}`,
          action: {
            type: primaryIntentGuest,
            contactData: contactDataGuest,
            redirectTo: "/contact",
          },
          userMode: "notLogin",
          sessionId: sessionId,
          userId: null,
        },
      });
    }

    // CHECK IF NOT_RELATED INTENT - Answer generic question without KashiRoute data
    if (primaryIntentGuest === "NOT_RELATED") {
      const chatQuery = require("../utils/chatQuery");

      // Check if topic is dangerous/harmful
      if (chatQuery.isDangerousTopic(question)) {
        const dangerousResponse =
          "I can't help with that topic as it may be harmful or dangerous. Please ask me something else! 🙂";

        const chatEntry = new ChatBot({
          userId: null,
          sessionId: sessionId,
          question,
          answer: dangerousResponse,
          userMode: "notLogin",
        });
        await chatEntry.save();

        return res.status(200).json({
          status: true,
          message: "Chat response generated successfully",
          data: {
            response: dangerousResponse,
            bookingLink: null,
            userMode: "notLogin",
            sessionId: sessionId,
            userId: null,
          },
        });
      }

      // Safe to answer - build generic prompt without KashiRoute data
      const genericPrompt = chatQuery.buildNotRelatedPrompt(question);
      const aiResponse = await groqcalling(genericPrompt, question);

      const chatEntry = new ChatBot({
        userId: null,
        sessionId: sessionId,
        question,
        answer: aiResponse,
        userMode: "notLogin",
      });
      await chatEntry.save();

      return res.status(200).json({
        status: true,
        message: "Chat response generated successfully",
        data: {
          response: aiResponse,
          bookingLink: null,
          userMode: "notLogin",
          sessionId: sessionId,
          userId: null,
        },
      });
    }

    // STEP 2: FILTER DATA BY DETECTED INTENT
    const filteredData = await intentDetection.getFilteredContextByIntent(
      question,
      {
        cars: cars,
        packages: packages,
        previousMessages: previousMessages,
      },
    );

    // STEP 3: BUILD CLEAN PROMPT WITH ONLY INTENT DATA
    const buildCleanPrompt = require("../utils/chatQuery").buildCleanPrompt;
    const systemPrompt = buildCleanPrompt(
      question,
      filteredData,
      detectedIntents[0], // primary intent
    );

    const aiResponse = await groqcalling(systemPrompt, question);

    // Parse booking links from response
    const { cleanResponse, bookingLink } = parseBookingLinks(aiResponse);

    // Save chat to database with sessionId
    const chatEntry = new ChatBot({
      userId: null,
      sessionId: sessionId,
      question,
      answer: cleanResponse,
      userMode: "notLogin",
    });
    await chatEntry.save();

    // Return response for guest
    return res.status(200).json({
      status: true,
      message: "Chat response generated successfully",
      data: {
        response: cleanResponse,
        bookingLink: bookingLink,
        userMode: "notLogin",
        sessionId: sessionId,
        userId: null,
      },
    });
  } catch (error) {
    console.error("Error in postChatbot:", error);
    return res.status(500).json({
      status: false,
      message: "Error processing chat request",
      error: error.message,
    });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const token = req.cookies.token;

    // Check if user is logged in
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Please login first",
      });
    }

    // Verify JWT token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.user._id;
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Invalid or expired token",
      });
    }

    // Fetch chat history for this user (PHASE 1 - LOGGED-IN ONLY) - Oldest to newest
    const chatHistory = await ChatBot.find({ userId, userMode: "login" })
      .select("question answer language createdAt")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      status: true,
      data: chatHistory,
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    return res.status(500).json({
      status: false,
      message: "Error fetching chat history",
      error: error.message,
    });
  }
};

/**
 * GET /chatbot/session/:sessionId
 * Get chat history for NON-LOGGED-IN users (GUESTS) by session ID
 *
 * PHASE 2 ENDPOINT: For guest users
 * - Returns all chat messages associated with sessionId
 * - Does NOT require authentication
 * - SessionId must be provided as URL parameter
 * - SessionId persists for 30 days
 */
exports.getSessionChat = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Validate session ID
    if (!sessionId || sessionId.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Session ID is required",
      });
    }

    // Fetch chat history for this session (PHASE 2 - GUEST ONLY) - Oldest to newest
    const chatHistory = await ChatBot.find({ sessionId, userMode: "notLogin" })
      .select("question answer language createdAt")
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      status: true,
      sessionId,
      data: chatHistory,
    });
  } catch (error) {
    console.error("Error in getSessionChat:", error);
    return res.status(500).json({
      status: false,
      message: "Error fetching session chat",
      error: error.message,
    });
  }
};

/**
 * DELETE /chatbot/clear
 * Clear chat history for LOGGED-IN users only
 *
 * PHASE 1 ENDPOINT: For authenticated users
 * - Deletes all chat messages associated with userId
 * - Requires valid JWT token
 * - Also clears any guest session cookies
 * - Rejects if user is not logged in
 */
exports.clearChatHistory = async (req, res) => {
  try {
    const token = req.cookies.token;

    // Check if user is logged in
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: Please login first",
      });
    }

    // Verify JWT token
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.user._id;
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Invalid or expired token",
      });
    }

    // Delete all chat entries for this user (PHASE 1 - LOGGED-IN ONLY)
    const result = await ChatBot.deleteMany({ userId, userMode: "login" });

    // Clear any guest session cookies
    res.clearCookie("chatbotSessionId");

    return res.status(200).json({
      status: true,
      message: "Chat history cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in clearChatHistory:", error);
    return res.status(500).json({
      status: false,
      message: "Error clearing chat history",
      error: error.message,
    });
  }
};
