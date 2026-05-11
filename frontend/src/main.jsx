import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles.css";

const router = createBrowserRouter(
  [
    {
      path: "/*",
      element: (
        <AuthProvider>
          <App />
        </AuthProvider>
      ),
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  },
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

window.addEventListener("load", () => {
  fetch("https://app.chatting.nav-code.com/detector/newUser/KashiRoute", {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      // User visited
    })
    .catch((err) => {
      // Visit tracking failed
    });
});