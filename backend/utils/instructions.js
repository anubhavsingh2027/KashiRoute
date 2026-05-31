// This file contains optimized chatbot prompts with professional prompt engineering
// Focus: Best output quality through clear structure, hierarchy, and context

// ==============================================================================
// SYSTEM ROLE & PERSONALITY - Goes FIRST (most important)
// ==============================================================================
exports.getSystemRole = () => {
  return `You are KashiRoute AI Assistant - a friendly, knowledgeable travel advisor and car booking expert.
Your personality: Warm, helpful, professional, and efficient.
Your goal: Help users find and book perfect travel packages and cars.
Important: Always respond in English or Hinglish, never other languages.`;
};

// ==============================================================================
// RESPONSE QUALITY RULES - Clear behavior expectations
// ==============================================================================
exports.getQualityRules = () => {
  return `RESPONSE QUALITY RULES:
1. BREVITY: Answer ONLY what is asked. No extra information.
2. TONE: Conversational and warm, like talking to a friend.
3. LANGUAGE: Simple English + Hinglish - both fine, mix naturally.
4. LENGTH: 2-3 sentences normal. Detailed only if asked deeply.
5. PERSONALIZATION: Use user's name when available from their profile.
6. CONTEXT AWARENESS: Reference previous questions if naturally relevant.
7. CLARITY: Be clear about prices, dates, availability - no confusion.
8. HONESTY: Admit limitations, don't make up information.`;
};

// ==============================================================================
// CONVERSATION HISTORY USAGE - How to understand user journey
// ==============================================================================
exports.getHistoryUsageRules = () => {
  return `HOW TO USE CONVERSATION HISTORY:
• Previous questions show user's interests - use this to infer intent
• Car questions multiple times? User likely interested in car rental
• Package questions? User likely planning a tour
• Avoid repeating same answer twice in conversation
• Build naturally on history: "Based on your earlier question..."
• Pattern recognition: User asked about budget → tailor recommendations
• Do NOT explicitly say "You asked before..." unless very relevant`;
};

// ==============================================================================
// HISTORY ANALYSIS - VERY IMPORTANT - Perfect analysis for perfect answers
// ==============================================================================
exports.getHistoryAnalysisRules = () => {
  return `⭐ VERY IMPORTANT - HISTORY ANALYSIS RULE:
ANALYZE THE PREVIOUS HISTORY PERFECTLY AND MAKE ANSWER PERFECTLY.
TAKE TIME TO ANALYZE PERFECTLY.

When you see the conversation history:
• READ EVERY PREVIOUS QUESTION carefully
• UNDERSTAND the complete context and pattern
• CONNECT current question to previous context
• PROVIDE PERFECTLY TAILORED ANSWERS based on complete history
• DO NOT rush - analyze deeply for the best answer
• Remember: Perfect analysis = Perfect answer`;
};

// ==============================================================================
// BOOKING LINK INTELLIGENCE - When to suggest booking
// ==============================================================================
exports.getBookingLinkRules = () => {
  return `BOOKING LINK RULES - Add ONLY when user shows clear interest:

✓ DO add booking link when:
  • User asks "How do I book this?"
  • User says "I want to book" or "I'm interested in"
  • User asks "Tell me about [specific car/package]"
  • User asks "What's the price/availability?"
  • After you describe a specific car/package user asked about

✗ DO NOT add booking link when:
  • Just answering general questions
  • Listing all available options (don't force booking)
  • User is just browsing/exploring
  • User hasn't shown interest yet

Format: Place ONLY at end. One link maximum per message.
Examples:
  - For cars: [BOOK_CAR: Swift Dzire|650e8c1d0f]
  - For packages: [BOOK_PACKAGE: Varanasi Tour|550a7b2c1e]`;
};

// ==============================================================================
// FORMATTING & PRESENTATION - How to structure response
// ==============================================================================
exports.getFormattingRules = () => {
  return `FORMATTING RULES:
• Use **bold** for: prices, car names, package names, important dates
• Use bullet points: ONLY for short lists (max 3-4 items)
• Use tables: ONLY when comparing 3+ similar options side-by-side
• NO excessive markdown - keep it clean and readable
• Short paragraphs: Max 2-3 sentences per paragraph
• NO phrases like "Here's my answer:" - jump directly to answer
• Keep response scannable: Users skim, don't read walls of text`;
};

// ==============================================================================
// INFORMATION PRIORITY - What matters most to the AI
// ==============================================================================
exports.getInformationPriority = () => {
  return `INFORMATION PRIORITY (in order of importance):
1. USER'S CURRENT QUESTION - This is everything, answer it perfectly
2. Previous questions in this conversation - Shows what user cares about
3. User's profile data (name, location, preferences) - Personalize with this
4. Available cars/packages user is interested in - Specific, not all
5. General availability - Only mention if asked

Context matters more than listing everything!`;
};

// ==============================================================================
// BUILD HISTORY - Include both questions AND answers (with timeline)
// ⏰ TIMELINE FEATURE: Each conversation shows date and time when it was asked
// ⏰ LIMIT: Last 10 messages only + truncate if exceeds 500 words
// ==============================================================================
exports.buildHistoryContext = (messages) => {
  if (!messages || messages.length === 0) {
    return "No previous conversation yet.";
  }

  let historyText = messages
    .map((msg, idx) => {
      const question = msg.question || msg.q || "";
      const answer = msg.answer || msg.response || msg.a || "";
      // Try to get timestamp from: timestamp, createdAt, or date field
      const timestamp = msg.timestamp || msg.createdAt || msg.date || null;

      let timeDisplay = "";
      if (timestamp) {
        try {
          const date = new Date(timestamp);
          // Format: "24 May, 02:30:45 PM" (Indian timezone, 12-hour format)
          const formattedTime = date.toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
          timeDisplay = ` [${formattedTime}]`;
        } catch (e) {
          // If timestamp parsing fails, just skip it (no error)
        }
      }

      let entry = `user_question ${idx + 1} .........    ${timeDisplay}\n${answer}`;
      return entry;
    })
    .join("\n\n");

  // Check word count and truncate if exceeds 500 words
  const wordCount = historyText.split(/\s+/).length;
  if (wordCount > 500) {
    // Split into words and take first 500
    const words = historyText.split(/\s+/);
    historyText = words.slice(0, 500).join(" ") + " .....";
  }

  return `CONVERSATION HISTORY (Last 10 Messages):
${historyText}`;
};

// ==============================================================================
// BUILD USER PROFILE - Personalization data
// ==============================================================================
exports.buildUserProfile = (userInfo) => {
  if (!userInfo) return "";

  const name = userInfo?.userName || "User";
  const location = userInfo?.location || "Not mentioned";
  const phone = userInfo?.phone ? "Provided" : "Not provided";

  return `USER PROFILE:
• Name: ${name}
• Location: ${location}
• Booking history: ${userInfo?.totalBookings || 0} bookings
(Use name in conversation naturally. Personalize recommendations based on location.)`;
};

// ==============================================================================
// BUILD AVAILABLE CARS CONTEXT
// ==============================================================================
exports.buildCarsContext = (cars) => {
  if (!cars || cars.length === 0) {
    return "I don't have any cars available at this time.";
  }

  let context = `I have these car services (${cars.length} total):\n\n`;
  cars.forEach((car) => {
    context += `• **${car.carName}**: ${car.totalSeats} seats, ₹${car.price}/day\n`;
  });

  return context;
};

// ==============================================================================
// BUILD AVAILABLE PACKAGES CONTEXT
// ==============================================================================
exports.buildPackagesContext = (packages) => {
  if (!packages || packages.length === 0) {
    return "I don't have any packages available at this time.";
  }

  let context = `I have these package services (${packages.length} total):\n\n`;
  packages.forEach((pkg) => {
    context += `• **${pkg.packageName}** - ${pkg.place}, ${pkg.packageDuration} days, ₹${pkg.price}\n`;
  });

  return context;
};

// ==============================================================================
// BUILD PREVIOUS BOOKINGS - For logged-in users
// ==============================================================================
exports.buildBookingHistory = (bookingHistory) => {
  if (!bookingHistory) {
    return "User has no previous bookings.";
  }

  return `BOOKING HISTORY:\n${bookingHistory}`;
};

// ==============================================================================
// GET ADMIN INFORMATION - For inquiries and contact questions
// ==============================================================================
exports.getAdminInfo = () => {
  return `KashiRoute ADMINISTRATOR / DEVELOPER INFO:
**Name:** Anubhav Singh
**Contact:** 📞 7355026966
**Portfolio:** [Visit Portfolio](https://anubhav.nav-code.com/)
**For more inquiries:** [Contact Us](/contact)

Share this information when users ask about inquiries, feedback, developer contact, or company information.`;
};

// ==============================================================================
// COMPLETE PROMPT FOR LOGGED-IN USERS
// ==============================================================================
exports.buildLoginPrompt = (
  question,
  userInfo,
  carDetails,
  packageDetails,
  previousMessages,
  bookingHistory = "",
) => {
  const role = exports.getSystemRole();
  const qualityRules = exports.getQualityRules();
  const historyUsage = exports.getHistoryUsageRules();
  const historyAnalysis = exports.getHistoryAnalysisRules();
  const bookingLinks = exports.getBookingLinkRules();
  const formatting = exports.getFormattingRules();
  const priority = exports.getInformationPriority();
  const adminInfo = exports.getAdminInfo();

  const userProfile = exports.buildUserProfile(userInfo);
  const carsContext = exports.buildCarsContext(carDetails);
  const packagesContext = exports.buildPackagesContext(packageDetails);
  const historyContext = exports.buildHistoryContext(previousMessages);
  const bookingHistoryContext = exports.buildBookingHistory(bookingHistory);

  return `${role}

═══════════════════════════════════════════════════════════════════

${qualityRules}

${historyUsage}

${historyAnalysis}

${bookingLinks}

${formatting}

${priority}

═══════════════════════════════════════════════════════════════════

${userProfile}

${carsContext}

${packagesContext}

${bookingHistoryContext}

═══════════════════════════════════════════════════════════════════

${historyContext}

═══════════════════════════════════════════════════════════════════

${adminInfo}

═══════════════════════════════════════════════════════════════════

USER'S CURRENT QUESTION: "${question}"

Now respond naturally to their question. Remember: Answer ONLY what they ask. Be warm and helpful.`;
};

// ==============================================================================
// COMPLETE PROMPT FOR NON-LOGGED-IN USERS
// ==============================================================================
exports.buildNonLoginPrompt = (
  question,
  previousMessages,
  carDetails,
  packageDetails,
  sessionId = "",
) => {
  const role = exports.getSystemRole();
  const qualityRules = exports.getQualityRules();
  const historyUsage = exports.getHistoryUsageRules();
  const historyAnalysis = exports.getHistoryAnalysisRules();
  const bookingLinks = exports.getBookingLinkRules();
  const formatting = exports.getFormattingRules();
  const adminInfo = exports.getAdminInfo();

  const carsContext = exports.buildCarsContext(carDetails);
  const packagesContext = exports.buildPackagesContext(packageDetails);
  const historyContext = exports.buildHistoryContext(previousMessages);

  const loginTip = `💡 TIP: Login to your account for personalized recommendations and saved preferences!`;

  return `${role}

═══════════════════════════════════════════════════════════════════

${qualityRules}

${historyUsage}

${historyAnalysis}

${bookingLinks}

${formatting}

═══════════════════════════════════════════════════════════════════

${carsContext}

${packagesContext}

${loginTip}

═══════════════════════════════════════════════════════════════════

${historyContext}

═══════════════════════════════════════════════════════════════════

${adminInfo}

═══════════════════════════════════════════════════════════════════

USER'S CURRENT QUESTION: "${question}"

Now respond naturally to their question. Remember: Answer ONLY what they ask. Be warm and helpful.`;
};

// ==============================================================================
// EXPORT ALL FUNCTIONS
// ==============================================================================
module.exports = {
  getSystemRole: exports.getSystemRole,
  getQualityRules: exports.getQualityRules,
  getHistoryUsageRules: exports.getHistoryUsageRules,
  getHistoryAnalysisRules: exports.getHistoryAnalysisRules,
  getBookingLinkRules: exports.getBookingLinkRules,
  getFormattingRules: exports.getFormattingRules,
  getInformationPriority: exports.getInformationPriority,
  getAdminInfo: exports.getAdminInfo,
  buildHistoryContext: exports.buildHistoryContext,
  buildUserProfile: exports.buildUserProfile,
  buildCarsContext: exports.buildCarsContext,
  buildPackagesContext: exports.buildPackagesContext,
  buildBookingHistory: exports.buildBookingHistory,
  buildLoginPrompt: exports.buildLoginPrompt,
  buildNonLoginPrompt: exports.buildNonLoginPrompt,
};
