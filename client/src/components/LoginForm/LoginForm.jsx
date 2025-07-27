import React, { useState } from "react";
import "../../assets/styles/login.css";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState(""); // לא email!
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }
    onLogin({ username, password });
  };

  return (
    <div className="login-form-root">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtext">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            autoFocus
            value={username} // ← זה השם הנכון
            onChange={e => setUsername(e.target.value)} // ← זה השם הנכון
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className="login-btn" type="submit">
            Login
          </button>
          {error && (
            <div className="login-error" style={{ color: "#e32840", marginTop: "12px" }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
