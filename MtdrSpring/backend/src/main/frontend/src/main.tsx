import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// initialize mocks in development if VITE_USE_MOCKS=true
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS) {
  console.log("Mocking API");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
