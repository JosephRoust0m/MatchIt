import React, { useEffect, useState } from "react";
import "../styles.css";
import Footer from "./Footer";

function Welcome() {
  const fullText = "Welcome to MatchIt";
  const [displayedText, setDisplayedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header>
        <nav>
          <ul style={{ listStyle: "none", display: "flex", justifyContent: "center", padding: 0, margin: "10px 0" }}>
            <li style={{ margin: "0 15px", display: "inline-block" }}>
              <a href="/jobs" style={{ textDecoration: "none", color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>Job Opportunities</a>
            </li>
            <li style={{ margin: "0 15px", display: "inline-block" }}>
              <a href="/compatibility" style={{ textDecoration: "none", color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>Compatibility</a>
            </li>
            <li style={{ margin: "0 15px", display: "inline-block" }}>
              <a href="/signin" style={{ textDecoration: "none", color: "white", fontWeight: "bold", fontSize: "1.1rem" }}>Sign In / Sign Up</a>
            </li>
          </ul>
        </nav>
      </header>
      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <h1 className="welcome-title" style={{ color: "#8A2BE2", fontSize: "3.5rem", marginTop: "5vh", fontWeight: "bold", letterSpacing: 2, display: "inline-block", animation: "slideInLeft 1s cubic-bezier(.4,2,.6,1)" }}>
          {displayedText}
          <span
            className={typingDone ? "blinking-cursor" : ""}
            style={{ color: "#8A2BE2", fontWeight: "bold", fontSize: "3.5rem", marginLeft: 2 }}
          >
            |
          </span>
        </h1>
        <div className="welcome-message" style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 16px rgba(138,43,226,0.10)",
          padding: "2.5rem 2rem 2rem 2rem",
          marginTop: 32,
          maxWidth: 540,
          textAlign: "center",
          transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
        }}>
          <p style={{ fontSize: "1.25rem", color: "#333", marginBottom: 12, lineHeight: 1.6, fontWeight: 500 }}>
            <span style={{ color: "#8A2BE2", fontWeight: "bold", fontSize: "1.3rem", textShadow: "0 2px 8px #e0d6f7" }}>MatchIt</span> is your modern job browsing app for 2025.<br /><br />
            <span style={{ color: "#8A2BE2", fontWeight: 600 }}>Browse jobs</span> and <span style={{ color: "#8A2BE2", fontWeight: 600 }}>test your compatibility</span> with any position by uploading your resume.<br /><br />
            Sign up and let MatchIt do the rest!
          </p>
          <div style={{ marginTop: 24 }}>
            <span style={{ fontSize: "2rem", color: "#8A2BE2", fontWeight: "bold", letterSpacing: 1 }}>🚀</span>
          </div>
        </div>
        <style>{`
          .welcome-title {
            display: inline-block;
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-80px); }
            to { opacity: 1; transform: translateX(0); }
          }
          .welcome-message:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 32px rgba(138,43,226,0.18);
          }
          .blinking-cursor {
            animation: blink 1s steps(1) infinite;
          }
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}

export default Welcome;
