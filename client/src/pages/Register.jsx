import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../assets/css/login.css";
import Logo from "../assets/img/Logo-chinh.png";

export default function Register() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  const register = (e) => {
    e.preventDefault();

    if (!email || !pass) return alert("Nhap day du thong tin");
    if (pass !== confirm) return alert("Mat khau khong khop");

    // Fake register
    localStorage.setItem("token", "registeredtoken");
    localStorage.setItem("user", JSON.stringify({ email }));

    navigate("/", { replace: true });
  };

  return (
    <div className="login-page">

      <div className="login-box">

        <div className="login-logo">
          <img
                src={Logo}
                alt="App Logo"
                className="logo-img"
            />
        </div>

        <h2 className="login-title">Create an account</h2>

        <form onSubmit={register} className="login-form">

          <input
            type="email"
            className="login-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <input
            type="password"
            className="login-input"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <button type="submit" className="login-btn">
            Create Account
          </button>

        </form>

        <div style={{ color: "#aaa", marginTop: 12 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#00A67E" }}>
            Login
          </Link>
        </div>

      </div>

    </div>
  );
}
