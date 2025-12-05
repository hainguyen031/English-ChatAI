import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ChatPage from "./pages/ChatPage";
import Register from "./pages/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={isLoggedIn ? <ChatPage /> : <Navigate to="/login" />}
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
    </>
  );
}

export default App;
