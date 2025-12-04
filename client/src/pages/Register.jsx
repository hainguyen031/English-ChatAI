import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/login.css";
import Logo from "../assets/img/Logo-chinh.png";
import { http } from "../lib/http";

export default function Register() {
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!username || !pass) {
      setError("Nhập đầy đủ thông tin");
      setLoading(false);
      return;
    }

    if (pass !== confirm) {
      setError("Mật khẩu không khớp");
      setLoading(false);
      return;
    }

    try {
      const res = await http.post("/user/register", {
        username,
        password: pass,
        confirmPassword: pass,
      });
      setSuccess(res.data.message);
      setUsername("");
      setPass("");
      setConfirm("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }

    // navigate("/", { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <img src={Logo} alt="App Logo" className="logo-img" />
        </div>

        <h2 className="login-title">Create an account</h2>

        <form onSubmit={register} className="login-form">
          <input
            type="text"
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        {!loading && error && (
          <div style={{ color: "red", marginTop: 12 }}>{error}</div>
        )}
        {!loading && success && (
          <div style={{ color: "green", marginTop: 12 }}>{success}</div>
        )}
      </div>
    </div>
  );
}
