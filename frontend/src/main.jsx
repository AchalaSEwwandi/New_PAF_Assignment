import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="985678395952-c50169jkdosp9hetfdor0ou8ok6dagqi.apps.googleusercontent.com">
      {path.startsWith('/resources') || path.startsWith('/bookings') || path.startsWith('/tickets') || path.startsWith('/admin/bookings') ? (
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      ) : (
        <App />
      )}
    </GoogleOAuthProvider>
  </React.StrictMode>
);