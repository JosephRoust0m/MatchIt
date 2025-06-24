import React, { useState } from "react";
import "../styles.css";
import Footer from "./Footer";
const API_ORIGIN = "http://localhost:8080";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [date, setDate] = useState("");
  const [jobType, setJobType] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!localStorage.getItem("token");

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      alert("Error: Job Role cannot be null. Please enter a job role.");
      return;
    }
    setLoading(true);
    const response = await fetch(`${API_ORIGIN}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, company, date, jobType }),
    });
    const data = await response.json();
    setJobs(data);
    setLoading(false);
  };

  const handleSaveJob = async (job) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_ORIGIN}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: job.title,
        company: job.organization,
        location: job.locations_derived[0],
        postedDate: job.date_posted.split("T")[0],
        deadline: job.date_validthrough.split("T")[0],
        jobUrl: job.url,
        jobId: job.id,
      }),
    });
    const dataRes = await response.json();
    if (response.ok) {
      alert(dataRes.message);
    } else {
      alert("Error: " + dataRes.message);
    }
  };

  return (
    <>
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
            {isAuthenticated ? (
              <>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a
                    href="/profile"
                    style={{
                      textDecoration: "none",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Profile
                  </a>
                </li>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a
                    href="/compatibility"
                    style={{
                      textDecoration: "none",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Compatibility
                  </a>
                </li>
                <li
                  style={{ margin: "0 15px", display: "inline-block" }}
                  id="log-out"
                >
                  <a
                    href="/signin"
                    style={{
                      textDecoration: "none",
                      color: "white",
                      fontWeight: "bold",
                    }}
                    onClick={handleLogout}
                  >
                    Log Out
                  </a>
                </li>
              </>
            ) : (
              <>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a
                    href="/compatibility"
                    style={{
                      textDecoration: "none",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Compatibility
                  </a>
                </li>
                <li style={{ margin: "0 15px", display: "inline-block" }}>
                  <a
                    href="/signin"
                    style={{
                      textDecoration: "none",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    Sign In / Sign Up
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <h2 style={{ textAlign: "center", marginTop: 20 }}>
        Explore Job Opportunities
      </h2>
      <form id="jobSearchForm" onSubmit={handleSubmit}>
        <label htmlFor="role">Job Role:</label>
        <input
          type="text"
          id="role"
          name="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />

        <label htmlFor="company">Company Name:</label>
        <input
          type="text"
          id="company"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <label htmlFor="date">
          Date Posted (YYYY/MM/DD) - Must be within the last 7 days:
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label htmlFor="jobType">Job Type:</label>
        <select
          id="jobType"
          name="jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
        >
          <option value="">Select Job Type</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-site">On-site</option>
        </select>
        <button type="submit">Search Jobs</button>
      </form>
      <main>
        <ul className="job-list">
          {loading ? (
            <li>Loading...</li>
          ) : (
            jobs.map((job) => (
              <li className="job-item" key={job.id}>
                <h2>{job.title}</h2>
                <p>
                  <strong>Company:</strong> {job.organization}
                </p>
                <p>
                  <strong>Location:</strong> {job.locations_derived[0]}
                </p>
                <p>
                  <strong>Posted on:</strong> {job.date_posted.split("T")[0]}
                </p>
                <p>
                  <strong>Deadline:</strong> {job.date_validthrough.split("T")[0]}
                </p>
                <p style={{ margin: "10px 0" }}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "black", fontWeight: "bold" }}
                  >
                    View Job
                  </a>
                </p>
                {isAuthenticated && (
                  <button
                    className="save-job"
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
                    onClick={() => handleSaveJob(job)}
                  >
                    Save Job
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </main>
       <Footer />
      <style>{`

        form {
            background-color: white;
            padding: 20px;
            max-width: 600px;
            margin: 20px auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        label {
            font-weight: bold;
            display: block;
            margin-top: 10px;
        }
        input, select {
            width: 95%;
            padding: 10px;
            margin-top: 5px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        button {
            width: 100%;
            padding: 12px;
            margin-top: 15px;
            background-color: black;
            color: white;
            font-weight: bold;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        button:hover {
            background-color: darkgray;
        }
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

      `}</style>
    </>
  );
}

export default Jobs;
