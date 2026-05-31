import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  sendChatbotMessage,
  getChatHistory,
  getSessionChat,
  clearChatHistory,
} from "../api/services";
import Toast from "../components/Toast";
import "./ChatbotPage.css";

// Helper function to get cookie value by name
const getCookieValue = (name) => {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

// Function to render message with markdown-like formatting
const renderMessage = (text) => {
  const lines = text.split("\n");
  const elements = [];

  let i = 0;
  let elementCount = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Booking link detection [BOOK_CAR: name|id] or [BOOK_PACKAGE: name|id]
    if (line.includes("[BOOK_CAR:") || line.includes("[BOOK_PACKAGE:")) {
      const carMatch = line.match(/\[BOOK_CAR:\s*(.+?)\|(.+?)\]/);
      const packageMatch = line.match(/\[BOOK_PACKAGE:\s*(.+?)\|(.+?)\]/);

      if (carMatch) {
        const [, carName, carId] = carMatch;
        elements.push(
          <div key={`booking-${elementCount}`} className="msg-booking-link">
            <a
              href={`/car-book?id=${carId.trim()}`}
              className="booking-button car-booking"
            >
              📌 Book {carName.trim()}
            </a>
          </div>,
        );
        elementCount++;
        i++;
        continue;
      }

      if (packageMatch) {
        const [, packageName, packageId] = packageMatch;
        elements.push(
          <div key={`booking-${elementCount}`} className="msg-booking-link">
            <a
              href={`/package-book?id=${packageId.trim()}`}
              className="booking-button package-booking"
            >
              📌 Book {packageName.trim()}
            </a>
          </div>,
        );
        elementCount++;
        i++;
        continue;
      }
    }

    // H1 (# Text)
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${elementCount}`} className="msg-h1">
          {line.substring(2)}
        </h1>,
      );
      elementCount++;
      i++;
    }
    // H2 (## Text)
    else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${elementCount}`} className="msg-h2">
          {line.substring(3)}
        </h2>,
      );
      elementCount++;
      i++;
    }
    // H3 (### Text)
    else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${elementCount}`} className="msg-h3">
          {line.substring(4)}
        </h3>,
      );
      elementCount++;
      i++;
    }
    // Table detection
    else if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const tableContent = tableLines.map((tableLine) => {
        const cells = tableLine.split("|").filter((cell) => cell.trim());
        return cells;
      });

      if (tableContent.length > 0) {
        elements.push(
          <div key={`table-${elementCount}`} className="msg-table">
            {tableContent.map((row, rowIdx) => (
              <div
                key={`row-${elementCount}-${rowIdx}`}
                className={`table-row ${rowIdx === 0 ? "header" : ""}`}
              >
                {row.map((cell, cellIdx) => (
                  <div
                    key={`cell-${elementCount}-${rowIdx}-${cellIdx}`}
                    className="table-cell"
                  >
                    {cell.trim()}
                  </div>
                ))}
              </div>
            ))}
          </div>,
        );
        elementCount++;
      }
    }
    // Comparison box detection [COMPARE: Title]
    else if (line.startsWith("[COMPARE:")) {
      const compareTitle =
        line.match(/\[COMPARE: (.*?)\]/)?.[1] || "Comparison";
      const compareItems = [];
      i++;

      while (i < lines.length && lines[i].startsWith("  -")) {
        compareItems.push(lines[i].substring(3).trim());
        i++;
      }

      elements.push(
        <div key={`compare-${elementCount}`} className="msg-compare-box">
          <div className="compare-title">{compareTitle}</div>
          <div className="compare-items">
            {compareItems.map((item, idx) => (
              <div
                key={`comp-item-${elementCount}-${idx}`}
                className="compare-item"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </div>,
      );
      elementCount++;
    }
    // Code block (```code```)
    else if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      elements.push(
        <pre key={`code-${elementCount}`} className="msg-code">
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      elementCount++;
    }
    // Regular line with potential bold text
    else {
      const lineWithFormatting = line
        .split(/(\*\*.*?\*\*)/g)
        .map((part, idx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={`bold-${elementCount}-${idx}`}>
                {part.substring(2, part.length - 2)}
              </strong>
            );
          }
          return part;
        });

      elements.push(
        <div key={`line-${elementCount}`} className="msg-line">
          {lineWithFormatting || "\u00A0"}
        </div>,
      );
      elementCount++;
      i++;
    }
  }

  return elements;
};

export default function ChatbotPage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isMounted, setIsMounted] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastMessageTimeRef = useRef(0);

  // Initialize session
  useEffect(() => {
    setIsMounted(true);

    const initializeChat = async () => {
      if (authUser && authUser._id) {
        // User is logged in - load chat history
        loadChatHistory();
      } else {
        // Non-logged-in user - try to load previous session chat
        const raw = getCookieValue("chatbotSessionId");
        console.log("Found chatbotSessionId cookie:", raw);
        const cookieSession = (raw || "").trim();
        // Treat these string values as invalid/missing
        const invalidValues = ["", "undefined", "null"];
        if (
          cookieSession &&
          !invalidValues.includes(cookieSession.toLowerCase())
        ) {
          setSessionId(cookieSession);
          await loadSessionChat(cookieSession);
        }
      }
    };

    initializeChat();

    return () => {
      setIsMounted(false);
    };
  }, [authUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showToast = (message, type = "info") => {
    if (!isMounted) return;
    setToast({ message, type });
  };

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }, 0);
  };

  const loadChatHistory = async () => {
    try {
      const response = await getChatHistory();
      if (response.status && response.data) {
        const formattedMessages = response.data.flatMap((msg, idx) => [
          {
            id: `hist-q-${idx}`,
            type: "user",
            text: msg.question,
          },
          {
            id: `hist-a-${idx}`,
            type: "bot",
            text: msg.answer || "",
          },
        ]);
        if (isMounted) {
          setMessages(formattedMessages);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const loadSessionChat = async (session) => {
    try {
      const response = await getSessionChat(session);
      if (response.status && response.data) {
        const formattedMessages = response.data.flatMap((msg, idx) => [
          { id: `sess-q-${idx}`, type: "user", text: msg.question },
          { id: `sess-a-${idx}`, type: "bot", text: msg.answer },
        ]);
        if (isMounted) {
          setMessages(formattedMessages);
          // ensure state sessionId matches the server (in case cookie was missing)
          if (!session && response.sessionId) {
            setSessionId(response.sessionId);
          }
        }
      }
    } catch (error) {
      console.error("Error loading session chat:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    // Debounce rapid submissions
    const now = Date.now();
    if (now - lastMessageTimeRef.current < 500) {
      return;
    }
    lastMessageTimeRef.current = now;

    if (!inputValue.trim()) {
      showToast("Please enter a question", "warning");
      return;
    }

    // Add user message to UI immediately with unique ID
    const userMessageId = `msg-${Date.now()}-user`;
    const userMessage = {
      id: userMessageId,
      type: "user",
      text: inputValue,
    };

    const currentInput = inputValue;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage(currentInput);

      if (!isMounted) return;

      if (response.status) {
        const botMessageId = `msg-${Date.now()}-bot`;
        const botMessage = {
          id: botMessageId,
          type: "bot",
          text: response.data.response,
          bookingLink: response.data.bookingLink, // Store booking link separately
        };
        setMessages((prev) => [...prev, botMessage]);

        // Update sessionId if it's a new guest user (from response or cookies)
        if (!authUser && response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }
      } else {
        showToast(response.message || "Error sending message", "error");
        // Remove the user message we just added
        setMessages((prev) => prev.filter((m) => m.id !== userMessageId));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      if (!isMounted) return;
      showToast("Error sending message", "error");
      // Remove the user message we just added
      setMessages((prev) => prev.filter((m) => m.id !== userMessageId));
    } finally {
      if (isMounted) {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear chat history?")) {
      return;
    }

    try {
      const response = await clearChatHistory();
      if (!isMounted) return;

      if (response.status) {
        setMessages([]);
        showToast("Chat history cleared successfully", "success");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      if (!isMounted) return;
      showToast("Error clearing chat history", "error");
    }
  };

  const handleLanguageToggle = () => {
    // Language toggle removed - English only
  };

  const startNewChat = () => {
    // Clear messages and sessionId - backend will create a new session on next message
    setMessages([]);
    setSessionId(null);
  };

  if (authLoading) {
    return (
      <div className="chatbot-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h1>KashiRoute Assistant</h1>
          <p className="user-info">
            {authUser ? `Welcome, ${authUser.userName}` : "Guest User"}
          </p>
        </div>
        <div className="header-actions">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="btn-clear"
              title="Clear chat"
            >
              🗑️ Clear
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={startNewChat}
              className="btn-new"
              title="Start new chat"
            >
              ➕ New
            </button>
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💬</div>
            <h2>Hello!</h2>
            <p>
              Ask about Kashmir travel, learn about car booking services, or get
              answers to any questions.
            </p>
            <p className="subtext">
              {authUser
                ? "All your conversations will be saved"
                : "You can chat as a guest"}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === "user" ? "👤" : "🤖"}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {renderMessage(message.text)}
                  </div>{" "}
                  {message.bookingLink && (
                    <div className="msg-booking-link">
                      {message.bookingLink.type === "BOOK_CAR" ? (
                        <a
                          href={`/car-book?id=${message.bookingLink.id}`}
                          className="booking-button car-booking"
                        >
                          📌 Book {message.bookingLink.name}
                        </a>
                      ) : (
                        <a
                          href={`/package-book?id=${message.bookingLink.id}`}
                          className="booking-button package-booking"
                        >
                          📌 Book {message.bookingLink.name}
                        </a>
                      )}
                    </div>
                  )}{" "}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="messages-end" />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="input-form">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question here..."
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="btn-send"
          >
            {isLoading ? "⏳" : "📤"}
          </button>
        </div>
        <p className="help-text">
          💡 Tip: You can ask in English about any topic.
        </p>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          autoClose={true}
          duration={3000}
        />
      )}
    </div>
  );
}
