import React, { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";
import "../styles.css";
import Footer from "./Footer";
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

const API_ORIGIN = "http://localhost:8080";

function Compatibility() {
  const [hasResume, setHasResume] = useState(false);
  const [uploadedTime, setUploadedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [useCurrentResume, setUseCurrentResume] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchResume = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setHasResume(false);
        return;
      }
      const response = await fetch(`${API_ORIGIN}/savedinfo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.resume) {
        setHasResume(true);
        setUploadedTime(data.uploaded_time);
      }
      setLoading(false);
    };
    fetchResume();
  }, []);

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let pdfText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      textContent.items.forEach((item) => {
        pdfText += item.str + " ";
      });
    }
    return pdfText.trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult("");
    const token = localStorage.getItem("token");
    let dataToSend = {};
    if (useCurrentResume && token) {
      const response = await fetch(`${API_ORIGIN}/savedinfo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      dataToSend = {
        file_content: data.resume,
        job_description: jobDescription,
      };
    } else {
      const file = fileInputRef.current.files[0];
      if (!file) {
        alert("Please upload a PDF file.");
        return;
      }
      const pdfText = await extractTextFromPDF(file);
      dataToSend = {
        file_content: pdfText,
        job_description: jobDescription,
      };
    }
    setResult("Loading...");
    const res = await fetch(`${API_ORIGIN}/compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });
    const resultData = await res.json();
    if (res.ok) {
      setResult(`Match Percentage: ${Number(resultData.match_percentage).toFixed(2)}%`);
    } else {
      setResult("Error: " + (resultData.message || res.statusText));
    }
  };

  // Navbar logic
  const isAuthenticated = !!localStorage.getItem("token");
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  return (
    <>
      <style>{`

        form {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            width: 400px;
            max-width: 100%;
            margin-left: 40%;
            margin-top: 10%;
        }
        label {
            display: block;
            margin: 15px 0 5px;
            font-weight: bold;
            color: #555;
        }
        input[type="file"] {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
            box-sizing: border-box;
            background-color: #fff;
            cursor: pointer;
            font-size: 16px;
            color: #333;
            position: relative;
        }
        input[type="file"]::file-selector-button {
            background: linear-gradient(to right, #6a11cb, #2575fc);
            color: white;
            border: none;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        input[type="file"]::file-selector-button:hover {
            background: linear-gradient(to right, #2575fc, #6a11cb);
        }
        textarea {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
            box-sizing: border-box;
        }
        input[type="submit"] {
            width: 100%;
            padding: 10px;
            border-radius: 5px;
            border: none;
            background:  black;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        input[type="submit"]:hover {
            background: darkgray;
        }
        #result {
            margin-top: 20px;
            font-size: 16px;
            text-align: center;
            font-family: Verdana, Geneva, Tahoma, sans-serif;
            font-size: large;
        }
 

      `}</style>
      <header>
        <nav>
          <ul style={{ listStyle: "none", display: "flex", justifyContent: "center", padding: 0, margin: "10px 0" }} id="navbar">
            {isAuthenticated ? (
              <>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a href="/profile" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>Profile</a>
                </li>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a href="/jobs" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>Job Opportunities</a>
                </li>
                <li style={{ margin: "0 15px", display: "inline-block" }} id="log-out">
                  <a href="/signin" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }} onClick={handleLogout}>Log Out</a>
                </li>
              </>
            ) : (
              <>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a href="/jobs" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>Job Opportunities</a>
                </li>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a href="/signin" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>Sign In / Sign Up</a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <form onSubmit={handleSubmit} style={{ marginTop: "2%", marginLeft: "auto", marginRight: "auto", width: "50%" }}>
        {loading ? null : hasResume ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: "#f9f9f9", padding: 20, borderRadius: 8, border: "1px solid #ccc" }}>
            <div style={{ flex: 1, marginRight: 20 }}>
              <label htmlFor="resume">Resume PDF:</label>
              <input type="file" name="file" id="resume" ref={fileInputRef} style={{ border: "1px solid #ccc" }} />
              <br />
              <br />
              <label htmlFor="job_description">Job Description:</label>
              <textarea
                name="job_description"
                id="job_description"
                rows={10}
                cols={30}
                required
                style={{ border: "1px solid #ccc" }}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <br />
              <br />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="use_current_resume" style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  id="use_current_resume"
                  name="use_current_resume"
                  style={{ marginRight: 10 }}
                  checked={useCurrentResume}
                  onChange={(e) => setUseCurrentResume(e.target.checked)}
                />
                Use Current Resume (Uploaded on: {new Date(uploadedTime).toLocaleString()})
              </label>
            </div>
          </div>
        ) : (
          <>
            <label htmlFor="resume">Resume PDF:</label>
            <input type="file" name="file" id="resume" ref={fileInputRef} required />
            <br />
            <br />
            <label htmlFor="job_description">Job Description:</label>
            <textarea
              name="job_description"
              id="job_description"
              rows={10}
              cols={50}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <br />
            <br />
          </>
        )}
        <input type="submit" value="Test Compatibility" style={{ marginTop: 20, border: "1px solid #ccc" }} />
      </form>
      <div className="rows" id="result" style={{ marginTop: 20, fontSize: "large", textAlign: "center", fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        {result}
      </div>
       <Footer />
    </>
     
  );
}

export default Compatibility;
