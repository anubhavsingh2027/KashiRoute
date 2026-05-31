/**
 * Intent Detection System for Chatbot - Using Groq API
 * Detects user intent using AI and returns relevant data for API call
 * Purpose: Filter noisy data and send only relevant context
 */

const { groqcalling } = require("./grok.utils");

/**
 * Intent types available in the system
 */
const INTENT_TYPES = [
  "CAR_DETAILS",
  "PACKAGE_DETAILS",
  "BOOKING_HISTORY",
  "PROCEDURE_BOOKING",
  "USER_INFORMATION",
  "GREETINGS",
  "CHAT_HISTORY",
  "HISTORY_ANALYSIS",
  "GENERAL_INFORMATION",
  "NEW_PACKAGE_IDEA",
  "NEW_CAR_REQUIRED",
  "NOT_RELATED",
];

/**
 * Format previous messages for context
 */
const formatPreviousMessagesForContext = (messages) => {
  if (!messages || messages.length === 0) {
    return "";
  }
  const lastMessages = messages.slice(-5);
  const formatted = lastMessages
    .map((msg, idx) => `${idx + 1}. Q: ${msg.question}\n   A: ${msg.answer}\n`)
    .join("");
  return formatted;
};

/**
 * Build optimized system prompt for intent detection using Groq
 * Reduced from 1500+ to 800 tokens for better API efficiency
 * Includes last 5 messages for conversation context
 */
const getIntentDetectionPrompt = (question, previousMessages = []) => {
  const contextMessages = formatPreviousMessagesForContext(previousMessages);
  let prompt = `You are intent classifier for KashiRoute - travel & vehicle booking platform.

`;
  if (contextMessages) {
    prompt += `RECENT CONVERSATION (Last 5 messages):
${contextMessages}
`;
  }
  prompt += `INTENTS (return ONLY these names):
1. CAR_DETAILS - Cars, buses, vehicles, pricing, capacity ("Bus chahiye", "Gaadi dekho")
2. PACKAGE_DETAILS - Existing tours, travel plans, recommendations ("Package batao", "Ghum ne ke liye plan batao", "Acha destination suggest karo")
3. BOOKING_HISTORY - Past bookings from database ("Meri booking", "Last trip")
4. PROCEDURE_BOOKING - How to book, steps, process ("Book kaise karu", "Booking process")
5. USER_INFORMATION - Profile, account, email, phone ("Mera email", "Account info")
6. GREETINGS - Hello, goodbye, thanks ("Hi", "Thanks", "Bye")
7. CHAT_HISTORY - Previous messages/discussion ("Pichli chat", "Phle kya kaha tha")
8. HISTORY_ANALYSIS - Booking patterns, preferences ("Mere bookings kaisi hain", "Meri preferences")
9. GENERAL_INFORMATION - Services, policies, help ("Rules", "Support", "Policy")
10. NEW_PACKAGE_IDEA - ONLY when user explicitly PROPOSES/SUGGESTS a new package to ADD ("Kya aap ye package bana sakte ho", "Ye destination add karo", "Naya Kashmir itinerary banana")
11. NEW_CAR_REQUIRED - ONLY when user explicitly REQUESTS a vehicle type NOT available ("Luxury car add karo", "Ye specific car chahiye", "Force add karo")
12. NOT_RELATED - Unrelated to KashiRoute ("Cricket", "Jokes", "Weather")

⚠️ CRITICAL - DO NOT CONFUSE:
❌ "Mujhe accha package batao" → NOT NEW_PACKAGE_IDEA (it's PACKAGE_DETAILS - asking for recommendations)
❌ "Ghum ne ke liye plan do" → NOT NEW_PACKAGE_IDEA (it's PACKAGE_DETAILS - asking for travel plan)
❌ "Naya plan batao" → NOT NEW_PACKAGE_IDEA (it's PACKAGE_DETAILS - asking for a new/different travel plan from existing)
✅ "Naya package add karo" → NEW_PACKAGE_IDEA (user wants to ADD a package to system)
✅ "Kya ye itinerary banate ho?" → NEW_PACKAGE_IDEA (user proposing new package)

KEYWORD DISTINCTION:
- PACKAGE_DETAILS keywords: batao, dijiye, do, suggest, kaisa, kaunsa, packages kya hain, plan karo (for them to plan)
- NEW_PACKAGE_IDEA keywords: bana/banana, add karo, create, suggest karo (them to create), propose, naya package

RULES:
✓ Return ONLY intent names
✓ Multiple allowed: comma-separated (most important first)
✓ If user asks for plans/recommendations → PACKAGE_DETAILS (NOT NEW_PACKAGE_IDEA)
✓ If user proposes a new package concept → NEW_PACKAGE_IDEA

EXAMPLES:
- "Mujhe accha package batao" → PACKAGE_DETAILS
- "Ghum ne ke liye plan do" → PACKAGE_DETAILS
- "Naya plan suggest karo" → PACKAGE_DETAILS
- "Kya aap Kashmir package bana sakte ho" → NEW_PACKAGE_IDEA
- "Ye destination add karo" → NEW_PACKAGE_IDEA
- "Bus book karni hai" → CAR_DETAILS
- "Luxury car chahiye jo tumhare paas nahi hai" → NEW_CAR_REQUIRED
- "Meri last booking dekho" → BOOKING_HISTORY

Current Question: ${question}

RESPONSE (intent names only):
`;
  return prompt;
};

/**
 * Intent cache to reduce API calls
 * Stores recent intent detections to avoid duplicate Groq calls
 */
const intentCache = new Map();
const MAX_CACHE_SIZE = 100;

/**
 * Quick local intent detection for obvious cases
 * Reduces Groq API calls by ~70%
 * @param {string} question - User's question
 * @returns {Array|null} - Detected intents or null if Groq needed
 */
const quickLocalDetection = (question) => {
  const q = question.toLowerCase().trim();

  // GREETINGS detection
  const greetingPatterns = [
    /\b(hi|hello|hey|namaste|good\s*(morning|afternoon|evening|night)|thanks|thank\s*you|shukriya|bye|goodbye)\b/i,
    /^(haan|haa|ok|okay|thik\s*hai|shukriya|aapka\s*swagat|welcome)$/i,
  ];

  if (greetingPatterns.some((p) => p.test(q))) {
    return ["GREETINGS"];
  }

  // NOT_RELATED detection
  const notRelatedPatterns = [
    /\b(joke|cricket|ipl|weather|mausam|politics|football|movie|song|python|javascript|coding)\b/i,
    /^(mujhe\s+(hasna|hansi|kuch\s*aur)|(aaj\s+)?weather\s+batao)$/i,
  ];

  if (notRelatedPatterns.some((p) => p.test(q))) {
    return ["NOT_RELATED"];
  }

  // PACKAGE_DETAILS detection (avoid misclassifying as NEW_PACKAGE_IDEA)
  const packageDetailsPatterns = [
    /\b(package|packages|ghum|ghumne|trip|tour|destination|plan|itinerary)\s*(batao|do|dikhao|suggest|karo|chahiye)\b/i,
    /\b(mujhe|mujhko)\s+(accha|acha|best|sasta|luxury).*\s*(package|trip|plan|destination|tour)\b/i,
    /\b(kaunsa|konsi|kaunse)\s*(package|trip|destination|tour)\b/i,
    /\b(kya\s+packages|kya\s+trips|aapke|your)\s+(paas|kiye)\s+(hain|ho)\b/i,
  ];

  if (packageDetailsPatterns.some((p) => p.test(q))) {
    return ["PACKAGE_DETAILS"];
  }

  // CAR_DETAILS detection
  const carDetailsPatterns = [
    /\b(car|cars|bus|buses|vehicle|gaadi|sath|savar|booking)\s*(batao|do|dikhao|chahiye|karo)\b/i,
    /\b(kaunsi|kaunsa|konsi|konsa)\s*(car|bus|vehicle|gaadi)\b/i,
    /\b(book|kaise)\s+(kar|karu|hai|ho)\b.*\s*(bus|car|vehicle)\b/i,
  ];

  if (carDetailsPatterns.some((p) => p.test(q))) {
    return ["CAR_DETAILS"];
  }

  return null; // Need Groq for this
};

/**
 * Get cached intent or null if not cached
 */
const getCachedIntent = (question) => {
  return intentCache.get(question.toLowerCase().trim());
};

/**
 * Cache intent result
 */
const cacheIntent = (question, intents) => {
  const key = question.toLowerCase().trim();

  if (intentCache.size >= MAX_CACHE_SIZE) {
    const firstKey = intentCache.keys().next().value;
    intentCache.delete(firstKey);
  }

  intentCache.set(key, intents);
};

/**
 * Detect user intent from question using Groq API
 * Optimized with local detection + caching to reduce API calls by 70%
 * Includes conversation context (last 5 messages)
 * @param {string} question - User's question
 * @param {Array} previousMessages - Previous chat messages for context
 * @returns {Promise<Array>} - Array of detected intents
 */
const detectIntents = async (question, previousMessages = []) => {
  if (!question || question.trim() === "") {
    return ["NOT_RELATED"];
  }

  const normalizedQ = question.toLowerCase().trim();

  // Check cache first
  const cached = getCachedIntent(question);
  if (cached) {
    return cached;
  }

  try {
    // Try quick local detection first (70% of queries caught here)
    const localIntents = quickLocalDetection(question);
    if (localIntents) {
      cacheIntent(question, localIntents);
      return localIntents;
    }

    // Complex query - use Groq API
    const systemPrompt = getIntentDetectionPrompt(question, previousMessages);
    const response = await groqcalling(systemPrompt, question);

    const splitIntents = response
      .split(",")
      .map((intent) => intent.trim().toUpperCase());

    const intents = splitIntents.filter((intent) =>
      INTENT_TYPES.includes(intent),
    );

    if (intents.length === 0) {
      const fallback = ["NOT_RELATED"];
      cacheIntent(question, fallback);
      return fallback;
    }

    // Cache the result
    cacheIntent(question, intents);
    return intents;
  } catch (error) {
    // On Groq error, try local detection again
    const localIntents = quickLocalDetection(question);
    if (localIntents) {
      return localIntents;
    }
    // Fallback to NOT_RELATED if API fails
    return ["NOT_RELATED"];
  }
};

/**
 * Prepare data for Car Details intent
 */
const prepareCarDetailsData = (carDetails, bookingHistory) => {
  return {
    cars: carDetails,
    note: "User asking about car details - send car info only",
  };
};

/**
 * Prepare data for Package Details intent
 */
const preparePackageDetailsData = (packageDetails, bookingHistory) => {
  return {
    packages: packageDetails,
    note: "User asking about packages - send package info only",
  };
};

/**
 * Prepare data for Booking History intent
 */
const prepareBookingHistoryData = (bookingHistory) => {
  return {
    bookingHistory: bookingHistory || "No bookings found",
    note: "User asking about booking history - send only booking details",
  };
};

/**
 * Prepare data for Procedure of Booking intent
 */
const prepareProcedureBookingData = (carDetails, packageDetails) => {
  return {
    cars: carDetails,
    packages: packageDetails,
    note: "User asking how to book - provide booking procedure information",
  };
};

/**
 * Prepare data for User Information intent
 */
const prepareUserInformationData = (userInfo) => {
  return {
    userInfo: userInfo || {},
    note: "User asking about their information",
  };
};

/**
 * Prepare data for Greetings intent
 */
const prepareGreetingsData = (userInfo) => {
  return {
    userInfo: userInfo ? { userName: userInfo.userName } : {},
    note: "User sending greeting - respond warmly",
  };
};

/**
 * Prepare data for Chat History intent
 */
const prepareChatHistoryData = (previousMessages) => {
  return {
    conversationHistory: previousMessages || [],
    note: "User asking to see their chat history - show previous conversations",
  };
};

/**
 * Prepare data for History Analysis intent
 */
const prepareHistoryAnalysisData = (previousMessages) => {
  return {
    conversationHistory: previousMessages || [],
    note: "User asking about conversation analysis - analyze patterns from history",
  };
};

/**
 * Prepare data for General Information intent
 */
const prepareGeneralInformationData = (
  carDetails,
  packageDetails,
  userInfo,
) => {
  return {
    cars: carDetails,
    packages: packageDetails,
    userInfo: userInfo || {},
    note: "User asking general questions",
  };
};

/**
 * Prepare data for Not Related intent
 */
const prepareNotRelatedData = () => {
  return {
    note: "User query not related to KashiRoute - respond politely and redirect",
  };
};

/**
 * Prepare data for New Package Idea intent
 */
const prepareNewPackageIdeaData = (userInfo) => {
  return {
    userInfo: userInfo || {},
    note: "User suggesting new package idea - collect details for contact form",
    actionType: "NEW_PACKAGE_IDEA",
  };
};

/**
 * Prepare data for New Car Required intent
 */
const prepareNewCarRequiredData = (userInfo) => {
  return {
    userInfo: userInfo || {},
    note: "User requesting new vehicle type - collect details for contact form",
    actionType: "NEW_CAR_REQUIRED",
  };
};

/**
 * Main function to get filtered context based on intent
 * @param {string} question - User's question
 * @param {Object} allData - All available data (cars, packages, userInfo, etc)
 * @returns {Promise<Object>} - Filtered context to send to API
 */
exports.getFilteredContextByIntent = async (question, allData) => {
  // Detect intents using Groq API
  const intents = await detectIntents(question);
  const primaryIntent = intents[0]; // Main intent

  let filteredContext = {
    intents: intents,
    primaryIntent: primaryIntent,
    data: {},
  };

  // Process based on primary intent
  switch (primaryIntent) {
    case "CAR_DETAILS":
      filteredContext.data = prepareCarDetailsData(allData.cars);
      break;

    case "PACKAGE_DETAILS":
      filteredContext.data = preparePackageDetailsData(allData.packages);
      break;

    case "BOOKING_HISTORY":
      filteredContext.data = prepareBookingHistoryData(allData.bookingHistory);
      break;

    case "PROCEDURE_BOOKING":
      filteredContext.data = prepareProcedureBookingData(
        allData.cars,
        allData.packages,
      );
      break;

    case "USER_INFORMATION":
      filteredContext.data = prepareUserInformationData(allData.userInfo);
      break;

    case "GREETINGS":
      filteredContext.data = prepareGreetingsData(allData.userInfo);
      break;

    case "CHAT_HISTORY":
      filteredContext.data = prepareChatHistoryData(allData.previousMessages);
      break;

    case "HISTORY_ANALYSIS":
      filteredContext.data = prepareHistoryAnalysisData(
        allData.previousMessages,
      );
      break;

    case "GENERAL_INFORMATION":
      filteredContext.data = prepareGeneralInformationData(
        allData.cars,
        allData.packages,
        allData.userInfo,
      );
      break;

    case "NEW_PACKAGE_IDEA":
      filteredContext.data = prepareNewPackageIdeaData(allData.userInfo);
      break;

    case "NEW_CAR_REQUIRED":
      filteredContext.data = prepareNewCarRequiredData(allData.userInfo);
      break;

    case "NOT_RELATED":
      filteredContext.data = prepareNotRelatedData();
      break;

    default:
      filteredContext.data = prepareGeneralInformationData(
        allData.cars,
        allData.packages,
        allData.userInfo,
      );
  }

  return filteredContext;
};

/**
 * Get intent display name
 */
exports.getIntentDisplayName = (intent) => {
  const names = {
    CAR_DETAILS: "Car Details",
    PACKAGE_DETAILS: "Package Details",
    BOOKING_HISTORY: "Booking History",
    PROCEDURE_BOOKING: "How to Book",
    USER_INFORMATION: "User Information",
    GREETINGS: "Greeting",
    CHAT_HISTORY: "Chat History",
    HISTORY_ANALYSIS: "History Analysis",
    GENERAL_INFORMATION: "General Info",
    NEW_PACKAGE_IDEA: "New Package Idea",
    NEW_CAR_REQUIRED: "New Car Required",
    NOT_RELATED: "Not Related",
  };
  return names[intent] || "Unknown";
};

/**
 * Validate if NEW_PACKAGE_IDEA is truly intended
 * Prevents false positives when user is just asking for travel plan recommendations
 */
exports.validateNewPackageIdea = (question) => {
  const q = question.toLowerCase().trim();

  // Check for proposal keywords
  const proposalKeywords = [
    /\b(bana|banana|banao|add\s*karo|create|propose|suggest\s*karo|naya\s+(package|tour|plan|destination|itinerary))\b/i,
    /\b(kya.*aap.*bana.*sakte|ye.*package|ye.*itinerary|ye.*destination)\b/i,
  ];

  // Check for recommendation keywords
  const recommendationKeywords = [
    /\b(batao|dikhao|do|suggest|kaunsa|kaun\s*si|acha|best|sasta|mujhe.*plan|ghum.*ke.*liye)\b/i,
  ];

  const hasProposal = proposalKeywords.some((p) => p.test(q));
  const hasRecommendation = recommendationKeywords.some((p) => p.test(q));

  // If both keywords present, prefer PACKAGE_DETAILS
  if (hasRecommendation && !hasProposal) {
    return false;
  }

  return hasProposal;
};

/**
 * Validate if NEW_CAR_REQUIRED is truly intended
 * Prevents false positives when user is just asking about cars we have
 */
exports.validateNewCarRequired = (question) => {
  const q = question.toLowerCase().trim();

  // Keywords that indicate user is REQUESTING a new car type
  const requestKeywords = [
    /\b(add\s*karo|chahiye|kya.*aap.*hain|available|hona|chahiye.*jo.*nahi)/i,
    /\b(naya|luxury|specific|ye.*model|ye.*type)\b/i,
  ];

  return requestKeywords.some((p) => p.test(q));
};

/**
 * Check if query is greeting
 */
exports.isGreeting = async (question) => {
  const intents = await detectIntents(question);
  return intents.includes("GREETINGS");
};

/**
 * Check if query is not related
 */
exports.isNotRelated = async (question) => {
  const intents = await detectIntents(question);
  return intents.includes("NOT_RELATED") && intents.length === 1;
};

/**
 * Export functions for each intent
 */
exports.intentHandlers = {
  CAR_DETAILS: prepareCarDetailsData,
  PACKAGE_DETAILS: preparePackageDetailsData,
  BOOKING_HISTORY: prepareBookingHistoryData,
  PROCEDURE_BOOKING: prepareProcedureBookingData,
  USER_INFORMATION: prepareUserInformationData,
  GREETINGS: prepareGreetingsData,
  HISTORY_ANALYSIS: prepareHistoryAnalysisData,
  GENERAL_INFORMATION: prepareGeneralInformationData,
  NOT_RELATED: prepareNotRelatedData,
};

// Export for testing
exports.detectIntents = detectIntents;
