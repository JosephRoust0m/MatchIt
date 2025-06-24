import React, { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";
import "../styles.css";
import Footer from "./Footer";
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

const API_ORIGIN = "http://localhost:8080";

function Profile() {
  const [jobs, setJobs] = useState([]);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [uploadedTime, setUploadedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorJobs, setErrorJobs] = useState("");
  const [errorResume, setErrorResume] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setJobs([]);
        setResumeUploaded(false);
        setErrorJobs("No saved jobs");
        setErrorResume("No Resume Found");
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
      setLoading(false);

      if (data["error"] === "No saved jobs") setErrorJobs(data["error"]);
      if (data["error2"] === "No Resume Found") setErrorResume(data["error2"]);
      if (data["jobs_saved"]) setJobs(data["jobs_saved"]);
      if (data.resume) {
        setResumeUploaded(true);
        setUploadedTime(data.uploaded_time);
      }
    };
    fetchData();
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

  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current.files[0];
    if (!file) {
      alert("Please upload a PDF file.");
      return;
    }
    const pdfText = await extractTextFromPDF(file);
    const dataToSend = { file_content: pdfText };
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_ORIGIN}/uploadresume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });
    if (response.ok) {
      alert("Resume uploaded successfully!");
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert("Error: " + errorData.message);
    }
  };

  const handleUnsave = async (jobId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_ORIGIN}/unsave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId }),
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      window.location.reload();
    } else {
      alert("Error: " + data.message);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  // Render logic for resume form and jobs
  let resumeSection = null;
  if (loading) {
    resumeSection = null;
  } else if (errorJobs === "No saved jobs" && errorResume === "No Resume Found") {
    resumeSection = (
      <form
        id="resumeForm"
        onSubmit={handleResumeSubmit}
        style={{
          marginTop: "2%",
          marginLeft: "auto",
          marginRight: "auto",
          width: "50%",
        }}
      >
        <label htmlFor="resume">Resume PDF:</label>
        <input
          type="file"
          name="file"
          id="resume"
          ref={fileInputRef}
          required
        />
        <br />
        <br />
        <input type="submit" value="Upload" className="upload-button" />
      </form>
    );
  } else if (errorJobs === "No saved jobs" && resumeUploaded) {
    resumeSection = (
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <div style={{ width: "48%" }}>
          <h3 style={{ textAlign: "center" }}>Upload New Resume</h3>
          <form
            id="resumeForm"
            onSubmit={handleResumeSubmit}
            style={{
              marginLeft: "auto",
              marginRight: "auto",
              width: "50%",
            }}
          >
            <label htmlFor="resume">Resume PDF:</label>
            <input
              type="file"
              name="file"
              id="resume"
              ref={fileInputRef}
              required
            />
            <input type="submit" value="Upload" className="upload-button" />
          </form>
        </div>
        <div style={{ width: "48%", textAlign: "center" }}>
          <h3>Keep Old Resume</h3>
          <p>Uploaded at: {new Date(uploadedTime).toLocaleString()}</p>
        </div>
      </div>
    );
  } else if (jobs.length > 0 && errorResume === "No Resume Found") {
    resumeSection = (
      <form
        id="resumeForm"
        onSubmit={handleResumeSubmit}
        style={{
          marginTop: "2%",
          marginLeft: "auto",
          marginRight: "auto",
          width: "50%",
        }}
      >
        <label htmlFor="resume">Resume PDF:</label>
        <input
          type="file"
          name="file"
          id="resume"
          ref={fileInputRef}
          required
        />
        <br />
        <br />
        <input type="submit" value="Upload" className="upload-button" />
      </form>
    );
  } else if (jobs.length > 0 && resumeUploaded) {
    resumeSection = (
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <div style={{ width: "48%" }}>
          <h3 style={{ textAlign: "center" }}>Upload New Resume</h3>
          <form
            id="resumeForm"
            onSubmit={handleResumeSubmit}
            style={{
              marginTop: "2%",
              marginLeft: "auto",
              marginRight: "auto",
              width: "50%",
            }}
          >
            <label htmlFor="resume">Resume PDF:</label>
            <input
              type="file"
              name="file"
              id="resume"
              ref={fileInputRef}
              required
            />
            <input type="submit" value="Upload" className="upload-button" />
          </form>
        </div>
        <div style={{ width: "48%", textAlign: "center" }}>
          <h3>Keep Old Resume</h3>
          <p>Uploaded at: {new Date(uploadedTime).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{`

        .job-list {
          list-style: none;
          padding: 0;
          margin: 20px auto;
          max-width: 800px;
        }
        .job-item {
          background-color: white;
          margin: 10px 0;
          padding: 15px;
          border-radius: 8px;
          border-left: 5px solid #9400D3;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .job-item h2 {
          color: black;
        }
        .job-item p {
          color: #333;
        }
        .job-item:hover {
          background-color: #f9f9f9;
          border-left-color: black;
          transform: scale(1.05);
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
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
        input[type="submit"] {
          width: 25%;
          padding: 10px;
          border-radius: 5px;
          border: none;
          background: black;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s ease;
          display: block;
          margin: 10px auto 0 auto;
        }
        input[type="submit"]:hover {
          background: darkgray;
        }
        #advice{
          transition: transform 0.2s;
          background-color: white;
          border-left: 5px solid #8A2BE2;
          padding: 16px;
          margin: 24px auto 0 auto;
          max-width: 600px;
          border-radius: 8px;
          color: #333;
        }
        #advice:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 16px rgba(138,43,226,0.15);
          border-left-color: black;
        }
      `}</style>
      <header>
        <nav>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              justifyContent: "center",
              padding: 0,
              margin: "10px 0",
            }}
            id="navbar"
          >
            <li style={{ margin: "0 15px" }}>
              <a href="/jobs" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>
                Job Opportunities
              </a>
            </li>
            <li style={{ margin: "0 15px" }}>
              <a href="/compatibility" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }}>
                Compatibility
              </a>
            </li>
            <li style={{ margin: "0 15px" }} id="log-out">
              <a href="/signin" style={{ textDecoration: "none", color: "white", fontWeight: "bold" }} onClick={handleLogout}>
                Log Out
              </a>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <div id="advice">
          <strong>Advice:</strong> For best accuracy, your resume should only contain your <b>education</b> and <b>skills</b>. Work experience is not required for compatibility evaluation.
        </div>
        {resumeSection}
        <hr style={{ border: "1px solid #ccc", margin: "20px 0" }} />
        <h2 style={{ textAlign: "center", color: "#333" }}>Saved Jobs</h2>
        <ul className="job-list">
          {loading ? (
            <li>Loading...</li>
          ) : errorJobs === "No saved jobs" ? (
            <li style={{ textAlign: "center", color: "black", fontStyle: "italic", margin: "20px 0" }}>
              No saved jobs found.
            </li>
          ) : (
            jobs.map((job) => (
              <li className="job-item" key={job.specific_id}>
                <h2>{job.title}</h2>
                <p><strong>Company:</strong> {job.organization}</p>
                <p><strong>Location:</strong> {job.location}</p>
                <p><strong>Posted on:</strong> {job.date_posted}</p>
                <p><strong>Deadline:</strong> {job.deadline}</p>
                <p style={{ margin: "10px 0" }}>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "black", fontWeight: "bold" }}>
                    View Job
                  </a>
                </p>
                <button
                  className="unsave-job"
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    padding: 10,
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                    width: "25%",
                    display: "block",
                    margin: "0 auto",
                  }}
                  onClick={() => handleUnsave(job.specific_id)}
                >
                  Remove Job
                </button>
              </li>
            ))
          )}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
