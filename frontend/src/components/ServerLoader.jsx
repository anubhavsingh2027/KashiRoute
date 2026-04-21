import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import getCheck from "../api/services";

export default function ServerLoader() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error | timeout
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);
  const timeoutRef = useRef(null);
  const isUnmounted = useRef(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    isUnmounted.current = false;
    // disable scrolling while loader is visible
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    attemptCheck();

    return () => {
      isUnmounted.current = true;
      document.body.style.overflow = prevOverflow;
      clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearTimer() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }

  function startTimeout() {
    clearTimer();
    timeoutRef.current = setTimeout(() => {
      if (isUnmounted.current) return;
      setStatus("timeout");
      setMessage("Took too long. You can retry or check back later.");
    }, 15000);
  }

  async function attemptCheck() {
    setStatus("loading");
    setMessage("");
    setAttempts((a) => a + 1);
    startTimeout();

    try {
      const res = await getCheck();

      if (isUnmounted.current) return;
      clearTimer();

      if (res && !res.error) {
        // success: animate fade-out then navigate
        setStatus("success");
        setFadingOut(true);
        setTimeout(() => navigate("/home"), 600);
      } else {
        setStatus("error");
        setMessage(
          res?.message ||
            `Server responded with status: ${res?.status || "unknown"}`,
        );
      }
    } catch (err) {
      if (isUnmounted.current) return;
      clearTimer();
      setStatus("error");
      setMessage(err?.message || "Network Error");
    }
  }

  return (
    <AnimatePresence>
      {!fadingOut && (
        <motion.div
          key="server-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative max-w-lg w-[90%] mx-4 p-6 rounded-2xl bg-gradient-to-br from-white/90 to-gray-100 shadow-2xl dark:from-slate-800 dark:to-slate-700"
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full bg-white/90"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.9,
                    ease: "linear",
                  }}
                />
              </motion.div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Starting Server...
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Please wait, this may take a few seconds
                </p>
              </div>

              <div className="w-full mt-3">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ x: -"100%" }}
                    animate={{ x: ["-100%", "0%", "100%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      ease: "linear",
                    }}
                    style={{ width: "40%" }}
                  />
                </div>
              </div>

              {status === "loading" && (
                <p className="text-xs text-gray-500 mt-2">
                  Server is starting, please wait... Sorry for the inconvenience
                </p>
              )}

              {status === "timeout" && (
                <div className="mt-3">
                  <p className="text-sm text-orange-600">{message}</p>
                  <div className="mt-3 flex gap-2 justify-center">
                    <button
                      onClick={attemptCheck}
                      className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm shadow hover:bg-indigo-700"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => setStatus("error")}
                      className="px-4 py-2 rounded-md border border-gray-300 text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="mt-3">
                  <p className="text-sm text-red-600">
                    {message || "Unable to reach server."}
                  </p>
                  <div className="mt-3">
                    <button
                      onClick={attemptCheck}
                      className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm shadow hover:bg-indigo-700"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
