// This file contains utility functions for building chatbot prompts and parsing responses
// NO DATABASE CALLS - All DB operations should be in controllers
const instructions = require("./instructions");
const intentDetection = require("./intentDetection");

// Profanity filter list (English only)
const profanityList = [
  "badword1",
  "badword2",
  "abuse",
  "inappropriate",
  "offend",
  "damn",
  "hell",
  "crap",
  "fuck",
  "shit",
  "ass",
  "bitch",
];

// Detect language from text - English only
const detectLanguage = (text) => {
  return "en";
};

// Check for profanity
const hasProfanity = (text) => {
  const lowerText = text.toLowerCase();
  return profanityList.some((word) => lowerText.includes(word));
};

// Clean profanity from text
const cleanProfanity = (text) => {
  let cleaned = text;
  profanityList.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, "***");
  });
  return cleaned;
};

// Old context builders moved to instructions.js for better organization

// Helper to parse booking links from AI response
const parseBookingLinks = (response) => {
  if (!response) return { cleanResponse: response, bookingLink: null };

  // Match pattern: [BOOK_CAR: name|id] or [BOOK_PACKAGE: name|id]
  const bookingLinkRegex = /\[(BOOK_CAR|BOOK_PACKAGE):\s*([^|]+)\|([^\]]+)\]/g;
  let bookingLink = null;

  let match;
  while ((match = bookingLinkRegex.exec(response)) !== null) {
    const type = match[1];
    const name = match[2].trim();
    const id = match[3].trim();

    bookingLink = {
      type: type, // BOOK_CAR or BOOK_PACKAGE
      name: name,
      id: id,
      fullText: match[0],
    };
  }

  // Remove booking link from response text
  const cleanResponse = response
    .replace(/\[(BOOK_CAR|BOOK_PACKAGE):\s*[^|]+\|[^\]]+\]/g, "")
    .trim();

  return { cleanResponse, bookingLink };
};

// Build context for logged-in users
exports.chatbotQuery_login = (
  question,
  userInfo,
  carDetails,
  packageDetails,
  previousMessages,
  userId,
  bookingHistory = "",
) => {
  return instructions.buildLoginPrompt(
    question,
    userInfo,
    carDetails,
    packageDetails,
    previousMessages,
    bookingHistory,
  );
};

// Build context for non-logged-in users
exports.chatbotQuery_notLogin = (
  question,
  sessionId,
  previousMessages,
  carDetails,
  packageDetails,
) => {
  return instructions.buildNonLoginPrompt(
    question,
    previousMessages,
    carDetails,
    packageDetails,
    sessionId,
  );
};

/**
 * ========================================
 * INTENT-BASED CONTEXT BUILDERS (NEW)
 * ========================================
 * These functions build prompts based on detected user intent
 * Filters out noisy data and sends only relevant context
 */

/**
 * Build context for logged-in users with intent filtering
 */
exports.chatbotQuery_login_withIntent = async (
  question,
  userInfo,
  carDetails,
  packageDetails,
  previousMessages,
  userId,
  bookingHistory = "",
) => {
  // Get filtered context based on intent (NOW ASYNC)
  const filteredContext = await intentDetection.getFilteredContextByIntent(
    question,
    {
      cars: carDetails,
      packages: packageDetails,
      userInfo: userInfo,
      bookingHistory: bookingHistory,
      previousMessages: previousMessages,
    },
  );

  // Build prompt based on intent
  return buildIntentBasedPrompt(
    question,
    filteredContext,
    userInfo,
    previousMessages,
    bookingHistory,
  );
};

/**
 * Build context for non-logged-in users with intent filtering
 */
exports.chatbotQuery_notLogin_withIntent = async (
  question,
  sessionId,
  previousMessages,
  carDetails,
  packageDetails,
) => {
  // Get filtered context based on intent (NOW ASYNC)
  const filteredContext = await intentDetection.getFilteredContextByIntent(
    question,
    {
      cars: carDetails,
      packages: packageDetails,
      previousMessages: previousMessages,
    },
  );

  // Build prompt based on intent
  return buildIntentBasedPromptGuest(
    question,
    filteredContext,
    previousMessages,
  );
};

/**
 * Build prompt based on detected intent (Logged-in users)
 * ONLY sends intent-filtered data, nothing else
 */
const buildIntentBasedPrompt = (
  question,
  filteredContext,
  userInfo,
  previousMessages,
  bookingHistory,
) => {
  const primaryIntent = filteredContext.primaryIntent;

  const systemRole = instructions.getSystemRole();
  const qualityRules = instructions.getQualityRules();

  let context = `
${systemRole}

${qualityRules}

===== DETECTED USER INTENT =====
Primary Intent: ${intentDetection.getIntentDisplayName(primaryIntent)}

===== INTENT-FILTERED DATA =====
${formatFilteredData(filteredContext.data)}

===== YOUR RESPONSE GUIDELINES FOR ${intentDetection.getIntentDisplayName(primaryIntent)} =====
${getIntentSpecificGuidelines(primaryIntent)}

===== USER QUESTION =====
${question}`;

  return context;
};

/**
 * Build prompt based on detected intent (Guest/Non-logged-in)
 * ONLY sends intent-filtered data, nothing else
 */
const buildIntentBasedPromptGuest = (
  question,
  filteredContext,
  previousMessages,
) => {
  const primaryIntent = filteredContext.primaryIntent;

  const systemRole = instructions.getSystemRole();
  const qualityRules = instructions.getQualityRules();

  let context = `
${systemRole}

${qualityRules}

===== DETECTED USER INTENT =====
Primary Intent: ${intentDetection.getIntentDisplayName(primaryIntent)}

===== INTENT-FILTERED DATA =====
${formatFilteredData(filteredContext.data)}

===== YOUR RESPONSE GUIDELINES FOR ${intentDetection.getIntentDisplayName(primaryIntent)} =====
${getIntentSpecificGuidelines(primaryIntent)}

===== USER QUESTION =====
${question}`;

  return context;
};

/**
 * Format filtered data for display in context
 */
const formatFilteredData = (data) => {
  if (!data || Object.keys(data).length === 0) {
    return "No specific data required for this query";
  }

  let formatted = "";

  if (data.cars) {
    formatted += `
AVAILABLE CARS:
${data.cars
  .map(
    (car) =>
      `- ${car.carName}: ${car.totalSeats} seats, ₹${car.price}/day, ${car.description}`,
  )
  .join("\n")}`;
  }

  if (data.packages) {
    formatted += `
AVAILABLE PACKAGES:
${data.packages
  .map(
    (pkg) =>
      `- ${pkg.packageName} (${pkg.place}): ${pkg.packageDuration} days, ₹${pkg.price}, ${pkg.description}`,
  )
  .join("\n")}`;
  }

  if (data.bookingHistory) {
    formatted += `
BOOKING HISTORY:
${data.bookingHistory}`;
  }

  if (data.userInfo && Object.keys(data.userInfo).length > 0) {
    formatted += `
USER INFORMATION:
- Name: ${data.userInfo.userName || "N/A"}
- Phone: ${data.userInfo.phone || "N/A"}
- Email: ${data.userInfo.email || "N/A"}`;
  }

  if (data.conversationHistory && data.conversationHistory.length > 0) {
    formatted += `
CONVERSATION PATTERN:
${data.conversationHistory
  .slice(-5)
  .map((msg) => `- Q: ${msg.question}`)
  .join("\n")}`;
  }

  if (data.note) {
    formatted += `
NOTE: ${data.note}`;
  }

  return formatted || "No specific data required";
};

/**
 * Format user info
 */
const formatUserInfo = (userInfo) => {
  if (!userInfo) return "Guest user";

  return `
- Name: ${userInfo.userName || "N/A"}
- Phone: ${userInfo.phone || "N/A"}
- Email: ${userInfo.email || "N/A"}
- Location: ${userInfo.location || "N/A"}
- Type: ${userInfo.userType || "Regular"}`;
};

/**
 * Format previous messages
 */
const formatPreviousMessages = (messages) => {
  if (!messages || messages.length === 0) {
    return "No previous conversation";
  }

  return messages
    .slice(-5)
    .map((msg) => `Q: ${msg.question}\nA: ${msg.answer}`)
    .join("\n---\n");
};

/**
 * Get intent-specific guidelines
 */
const getIntentSpecificGuidelines = (intent) => {
  const guidelines = {
    CAR_DETAILS: `
• Focus on: Car specs, seating, price, fuel type, AC/non-AC
• Be specific about: Model, capacity, daily rate, features
• Don't include: Unrelated package information
• Suggest booking if user shows interest in a specific car`,

    PACKAGE_DETAILS: `
• Focus on: Package name, destination, duration, price, itinerary
• Be specific about: Place details, number of days/nights, included services
• Don't include: Unrelated car information
• Suggest booking if user shows interest in a specific package`,

    BOOKING_HISTORY: `
• Show: Only user's past bookings with dates, prices, confirmations
• Be specific about: Car/package names, booking dates, amounts paid
• Calculate: Total amount spent, number of bookings
• Don't speculate: Only show confirmed bookings from history`,

    PROCEDURE_BOOKING: `
• Explain: Step-by-step booking process clearly
• Include: How to select car/package, payment options, confirmation
• Be helpful: Make it simple and easy to understand
• Suggest: Real examples if relevant`,

    USER_INFORMATION: `
• Show: User's profile information (name, email, phone, location)
• Be respectful: Don't share sensitive info unnecessarily
• Offer: Option to update information if needed
• Verify: Always confirm you're showing correct user`,

    GREETINGS: `
• Respond warmly and naturally
• Use user's name if available
• Be brief: 1-2 sentences
• Transition: Gently guide to how you can help them`,

    CHAT_HISTORY: `
• Show: User's previous conversation messages in order
• Display: Each question and answer from the conversation
• Format: Clear, chronological order (oldest to newest)
• Include: Timestamps or sequence numbers if available
• Be helpful: Let user review their past interactions`,

    HISTORY_ANALYSIS: `
• Analyze: Patterns in previous questions
• Identify: User preferences and interests
• Suggest: Relevant services based on history
• Be insightful: Show understanding of their journey`,

    GENERAL_INFORMATION: `
• Be informative and helpful
• Provide accurate information
• Be concise: Answer what's asked
• Offer: Additional help if needed`,

    NOT_RELATED: `
• Politely explain: This service is for KashiRoute bookings
• Redirect: Ask what KashiRoute services you can help with
• Be friendly: Don't make user feel bad
• Suggest: Car booking or package tours`,
  };

  return guidelines[intent] || guidelines.GENERAL_INFORMATION;
};

/**
 * ========================================
 * CLEAN PROMPT BUILDER (PERFECT 3-STEP FLOW)
 * ========================================
 * STEP 1: Detect Intent with Groq
 * STEP 2: Filter Data by Intent
 * STEP 3: Build Clean Prompt with ONLY Intent Data
 * STEP 4: Send to Groq for Response
 */

/**
 * Build clean prompt with ONLY intent-filtered data
 * NO noise, NO unnecessary data - PERFECTLY CLEAN
 *
 * @param {string} question - User's question
 * @param {object} filteredData - Data filtered by intent (from intentDetection)
 * @param {string} primaryIntent - Primary intent detected
 * @returns {string} - Clean system prompt with only relevant data
 */
exports.buildCleanPrompt = (question, filteredData, primaryIntent) => {
  const intentDetection = require("./intentDetection");
  const systemRole = instructions.getSystemRole();
  const qualityRules = instructions.getQualityRules();

  // Build clean context with ONLY intent-filtered data
  let cleanContext = `
${systemRole}

${qualityRules}

===== DETECTED USER INTENT =====
Intent: ${intentDetection.getIntentDisplayName(primaryIntent)}

===== INTENT-SPECIFIC DATA ONLY =====
${formatFilteredData(filteredData.data)}

===== RESPONSE GUIDELINES FOR THIS INTENT =====
${getIntentSpecificGuidelines(primaryIntent)}

===== USER QUESTION =====
${question}

===== INSTRUCTIONS =====
Respond ONLY based on the intent-specific data provided above.
Do not include information outside this intent.
Be precise, concise, and helpful.`;

  return cleanContext;
};

/**
 * Build prompt for special intents: NEW_PACKAGE_IDEA and NEW_CAR_REQUIRED
 * Asks Groq to generate subject + description for contact form
 * User can copy-paste these on contact page
 */
exports.buildContactFormPrompt = (question, primaryIntent, userInfo = {}) => {
  const intentName =
    primaryIntent === "NEW_PACKAGE_IDEA" ? "Package Idea" : "Vehicle Request";

  const prompt = `You are an AI assistant for KashiRoute - travel & vehicle booking platform.

The user wants to suggest a ${primaryIntent === "NEW_PACKAGE_IDEA" ? "NEW TRAVEL PACKAGE" : "NEW VEHICLE TYPE"}.

Your task: Generate a professional subject line and description for a contact form that the user will fill out.

USER'S REQUEST/IDEA:
"${question}"

User Details:
Name: ${userInfo?.userName || "Not provided"}
Email: ${userInfo?.email || "Not provided"}
Phone: ${userInfo?.phone || "Not provided"}

GENERATE RESPONSE IN THIS EXACT FORMAT:
SUBJECT: [Generate a professional 1-2 line subject]
DESCRIPTION: [Generate a 3-4 line description that summarizes the user's idea/request with key details]

Make it concise, professional, and ready to copy-paste into a contact form.
Include specific details from their request.`;

  return prompt;
};

/**
 * Parse contact form data from Groq response
 * Extracts subject and description from formatted response
 */
exports.parseContactFormResponse = (response) => {
  try {
    // Match SUBJECT: ... and DESCRIPTION: ...
    const subjectMatch = response.match(/SUBJECT:\s*(.+?)(?:\n|DESCRIPTION:)/i);
    const descriptionMatch = response.match(/DESCRIPTION:\s*(.+?)$/is);

    const subject = subjectMatch
      ? subjectMatch[1].trim()
      : "New Idea Suggestion";
    const description = descriptionMatch
      ? descriptionMatch[1].trim()
      : response.trim();

    return {
      subject: subject,
      description: description,
      success: true,
    };
  } catch (error) {
    console.error("Error parsing contact form response:", error);
    return {
      subject: "New Idea Suggestion",
      description: "User submitted a new idea - please review",
      success: false,
    };
  }
};

/**
 * Check if question is about a dangerous/harmful topic
 * Returns true if topic should not be answered
 */
exports.isDangerousTopic = (question) => {
  const dangerousKeywords = [
    "bomb",
    "explosive",
    "poison",
    "kill",
    "suicide",
    "harm",
    "weapon",
    "gun",
    "rifle",
    "attack",
    "terroris",
    "hack",
    "fraud",
    "steal",
    "robbery",
    "rape",
    "abuse",
    "drug",
    "cocaine",
    "heroin",
    "meth",
  ];

  const lowerQ = question.toLowerCase();
  return dangerousKeywords.some((keyword) => lowerQ.includes(keyword));
};

/**
 * Build generic prompt for NOT_RELATED questions
 * No KashiRoute data included - just answer user's question safely
 */
exports.buildNotRelatedPrompt = (question) => {
  return `You are a helpful general-purpose AI assistant.

The user is asking about something not related to travel or vehicle booking.

Answer the question helpfully and accurately. Keep response concise (2-3 sentences).

User Question: "${question}"

Provide a direct, helpful answer.`;
};

// Export helper functions
exports.detectLanguage = detectLanguage;
exports.hasProfanity = hasProfanity;
exports.cleanProfanity = cleanProfanity;
exports.parseBookingLinks = parseBookingLinks;
