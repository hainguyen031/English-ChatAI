import React, { useState } from "react";
import "../assets/css/login.css";
import { Link } from "react-router-dom";
import Logo from "../assets/img/Logo-chinh.png";
import { http } from "../lib/http";

export default function Login() {
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!username || !pass) {
      setError("Nhập đầy đủ thông tin");
      setLoading(false);
      return;
    }

    try {
      const res = await http.post("/user/login", {
        username: username,
        password: pass,
      });
      console.log(res);
      const token = res.data.data.token;

      localStorage.setItem("token", token);

      // navigate("/", { replace: true });
      window.location.href = "/";
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Đăng nhập thất bại!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        {/* Logo */}
        <div className="login-logo">
          <img src={Logo} alt="App Logo" className="logo-img" />
        </div>

        <h2 className="login-title">Login to continue</h2>

        <form onSubmit={login} className="login-form">
          <input
            type="text"
            placeholder="Username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        {!loading && error && (
          <div style={{ color: "red", marginTop: 12 }}>{error}</div>
        )}
      </div>
    </div>
  );
}
