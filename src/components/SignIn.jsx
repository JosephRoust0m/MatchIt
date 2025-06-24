import React, { useState } from "react";
import Footer from "./Footer";
const API_ORIGIN = "http://localhost:8080";

function Signin() {
  const [showSignIn, setShowSignIn] = useState(true);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpPasswordVerify, setSignUpPasswordVerify] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    const response = await fetch(`${API_ORIGIN}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: signInEmail, password: signInPassword }),
    });
    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      window.location.href = "/jobs";
    } else {
      alert("Sign In failed: " + data.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (signUpPassword !== signUpPasswordVerify) {
      alert("Passwords do not match!");
      return;
    }
    if (signUpPassword.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }
    const response = await fetch(`${API_ORIGIN}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: signUpEmail,
        password: signUpPassword,
        username: signUpUsername,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
    } else {
      alert("Sign Up failed: " + data.message);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#f4f4f9", minHeight: "100vh", color: "#333" }}>
      <nav
        className="navbar"
        style={{
          backgroundColor: "#8A2BE2",
          color: "white",
          padding: "1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 0,
            margin: "10px 0",
            width: "100%",
          }}
        >
          <li style={{ margin: "0 15px", display: "inline-block" }}>
            <a href="/jobs" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>
              Job Opportunities
            </a>
          </li>
          <li style={{ margin: "0 15px", display: "inline-block" }}>
            <a href="/compatibility" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>
              Compatibility
            </a>
          </li>
        </ul>
      </nav>

      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          marginBottom: "2rem",
          marginTop: "2rem",
        }}
      >
        <div
          className="form-container"
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: 8,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            width: "100%",
            maxWidth: 400,
          }}
        >
          <div
            className="form-toggle"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <button
              id="signInBtn"
              onClick={() => setShowSignIn(true)}
              style={{
                flex: 1,
                padding: "0.5rem",
                margin: "0 0.25rem",
                border: "none",
                backgroundColor: "#8A2BE2",
                color: "white",
                fontSize: "1rem",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              Sign In
            </button>
            <button
              id="signUpBtn"
              onClick={() => setShowSignIn(false)}
              style={{
                flex: 1,
                padding: "0.5rem",
                margin: "0 0.25rem",
                border: "none",
                backgroundColor: "#8A2BE2",
                color: "white",
                fontSize: "1rem",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              Sign Up
            </button>
          </div>

          {showSignIn ? (
            <form className="form" style={{ display: "flex", flexDirection: "column" }} onSubmit={handleSignIn}>
              <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>Sign In</h2>
              <label htmlFor="signInEmail" style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                Email
              </label>
              <input
                type="email"
                id="signInEmail"
                name="email"
                required
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: "1rem",
                  width: "100%",
                }}
              />
              <label htmlFor="signInPassword" style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                Password
              </label>
              <input
                type="password"
                id="signInPassword"
                name="password"
                required
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: "1rem",
                  width: "100%",
                }}
              />
              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#8A2BE2",
                    color: "white",
                    border: "none",
                    fontSize: "1rem",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          ) : (
            <form className="form" style={{ display: "flex", flexDirection: "column" }} onSubmit={handleSignUp}>
              <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>Sign Up</h2>
              <label htmlFor="signUpUsername" style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                Username
              </label>
              <input
                type="text"
                id="signUpUsername"
                name="username"
                required
                value={signUpUsername}
                onChange={(e) => setSignUpUsername(e.target.value)}
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: "1rem",
                  width: "100%",
                }}
              />
              <label htmlFor="signUpEmail" style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                Email
              </label>
              <input
                type="email"
                id="signUpEmail"
                name="email"
                required
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: "1rem",
                  width: "100%",
                }}
              />
              <label htmlFor="signUpPassword" style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                Password
              </label>
              <input
                type="password"
                id="signUpPassword"
                name="password"
                required
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: "1rem",
                  width: "100%",
                }}
              />
              <label htmlFor="signUpPasswordVerify" style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>
                Verify Password
              </label>
              <input
                type="password"
                id="signUpPasswordVerify"
                name="passwordVerify"
                required
                value={signUpPasswordVerify}
                onChange={(e) => setSignUpPasswordVerify(e.target.value)}
                style={{
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  fontSize: "1rem",
                  width: "100%",
                }}
              />
              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "#8A2BE2",
                    color: "white",
                    border: "none",
                    fontSize: "1rem",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  Sign Up
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
     <Footer/>
    </div>
  );
}

export default Signin;
