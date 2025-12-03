import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/login.css";
import { Link } from "react-router-dom";
import Logo from "../assets/img/Logo-chinh.png";
export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();

    // Fake auth (ban co the goi API that)
    if (email === "admin@gmail.com" && pass === "123456") {
      localStorage.setItem("token", "mysecrettoken");
      navigate("/", { replace: true });
    } else {
      alert("Sai thong tin dang nhap");
    }
  };

  return (
    <div className="login-page">

      <div className="login-box">

        {/* Logo */}
        <div className="login-logo">
          <img
                src={Logo}
                alt="App Logo"
                className="logo-img"
            />
        </div>

        <h2 className="login-title">Login to continue</h2>

        <form onSubmit={login} className="login-form">

          <input
            type="email"
            placeholder="Email address"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <button className="login-btn" type="submit">
            Continue
          </button>
          <div style={{ color: "#aaa", marginTop: 12 }}>
            New here?{" "}
            <Link to="/register" style={{ color: "#00A67E" }}>
                Create an account
            </Link>
            </div>

        </form>

      </div>

    </div>
  );
}
