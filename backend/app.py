from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
from job_fetcher import fetch_job_opportunities
from compatibility_calculator import compare_requirements
import os
import psycopg2
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from datetime import datetime
from dotenv import load_dotenv
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import certifi
import bcrypt

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
ca = certifi.where()

mongo_client = MongoClient(MONGO_URL)
db = mongo_client["matchit"]
users_col = db["users"]
jobs_col = db["jobs"]

# Initialize Flask app
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)


@app.route('/jobs', methods=['POST'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def jobs():
    try:
        data = request.get_json()
        role = data.get('role')
        company = data.get('company')
        date = data.get('date')
        job_type = data.get('jobType')

        if not role:
            return jsonify({"error": "Role cannot be null"}), 400

        jobs = fetch_job_opportunities(role=role, company=company, date=date, job_type=job_type)
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/compatibility', methods=['POST'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def compatibility():
    try:
        data = request.get_json()
        if not data or 'file_content' not in data or 'job_description' not in data:
            return jsonify({"error": "Missing file_content or job_description"}), 400
        resume_text = data['file_content']
        job_description = data['job_description']
        match_percentage = compare_requirements(resume_text, job_description)
        return jsonify({"match_percentage": match_percentage})
    except Exception as e:
        return jsonify({"error": "An error occurred while processing the request"}), 500

@app.route('/signin', methods=['POST'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_col.find_one({"email": email})
    #print(user)
    if user:
        db_password = user.get("password")
        if db_password and bcrypt.checkpw(password.encode('utf-8'), db_password):
            access_token = str(user["email"])
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"status": "error", "message": "Wrong email or password, try again"}), 401
    else:
        return jsonify({"status": "error", "message": "User not found, please sign up"}), 401

@app.route('/signup', methods=['POST'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if not email or not password or not username:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    if users_col.find_one({"email": email}):
        return jsonify({"status": "error", "message": "Email already exists"}), 409

    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    users_col.insert_one({
        "username": username,
        "email": email,
        "password": hashed_pw,
        "saved_jobs": [],
        "resume": None,
        "time_uploaded": None
    })
    return jsonify({"status": "success", "message": "User registered successfully"}), 201

@app.route('/save', methods=['POST'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def saveJob():
    data = request.get_json()
    title = data.get('title')
    company = data.get('company')
    location = data.get('location')
    postedDate = data.get('postedDate')
    deadline = data.get('deadline')
    jobUrl = data.get('jobUrl')
    jobId = data.get('jobId')

    if not jobs_col.find_one({"specific_id": jobId}):
        try:
            jobs_col.insert_one({
                "title": title,
                "organization": company,
                "location": location,
                "date_posted": postedDate,
                "deadline": deadline,
                "url": jobUrl,
                "specific_id": jobId
            })
        except Exception as e:
            return jsonify({"status": "error", "message": "Error adding job to saved list"}), 500

    user_email = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
    user = users_col.find_one({"email": str(user_email)})
    print(user)
    saved_jobs = user.get("saved_jobs", [])
    if not jobExists(saved_jobs, int(jobId)):
        try:
            saved_jobs.append(int(jobId))
            users_col.update_one({"email": user["email"]}, {"$set": {"saved_jobs": saved_jobs}})
            return jsonify({"status": "success", "message": "Job saved successfully"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": "Error saving job"}), 500
    else:
        return jsonify({"status": "error", "message": "Job already exists"}), 401

@app.route('/savedinfo', methods=['GET'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def getSavedInfo():
    try:
        user_email = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
        user = users_col.find_one({"email": str(user_email)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        saved_jobs = user.get("saved_jobs", [])
        if not saved_jobs:
            resume = user.get("resume")
            uploaded_time = user.get("time_uploaded")
            if not resume:
                return jsonify({"error": "No saved jobs", "error2": "No Resume Found"}), 200
            else:
                return jsonify({"error": "No saved jobs", "resume": resume, "uploaded_time": uploaded_time}), 200

        jobs_list = []
        for job_id in saved_jobs:
            job = jobs_col.find_one({"specific_id": str(job_id)})
            if job:
                jobs_list.append({
                    "title": job.get("title"),
                    "organization": job.get("organization"),
                    "location": job.get("location"),
                    "date_posted": job.get("date_posted"),
                    "deadline": job.get("deadline"),
                    "url": job.get("url"),
                    "specific_id": job.get("specific_id")
                })
        resume = user.get("resume")
        uploaded_time = user.get("time_uploaded")
        print(resume)
        print(uploaded_time)
        if not resume:
            return jsonify({"jobs_saved": jobs_list, "error2": "No Resume Found"}), 200
        else:
            return jsonify({"jobs_saved": jobs_list, "resume": resume, "uploaded_time": uploaded_time}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/unsave', methods=['POST'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def unsaveJob():
    data = request.get_json()
    jobId = data.get('jobId')
    user_email = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
    user = users_col.find_one({"email": str(user_email)})  
    if not user:
        return jsonify({"error": "User not found"}), 404
    saved_jobs = user.get("saved_jobs", [])
    if removeId(int(jobId), saved_jobs):
        users_col.update_one({"email": user["email"]}, {"$set": {"saved_jobs": saved_jobs}})
        return jsonify({"status": "success", "message": "Job unsaved successfully"}), 200
    else:
        return jsonify({"error": "Job not found in saved jobs"}), 404

@app.route('/uploadresume', methods=['POST'])
@cross_origin(origin='localhost', ports=[3000, 3001])
def saveResume():
    data = request.get_json()
    resume = data.get('file_content')
    time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    user_email = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
    user = users_col.find_one({"email": str(user_email)})
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404
    try:
        users_col.update_one({"email": user["email"]}, {"$set": {"resume": resume, "time_uploaded": time}})
        return jsonify({"status": "success", "message": "Resume saved successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": "Error saving resume"}), 500
    

#Helper function to check if job exists in saved jobs
def jobExists(saved_jobs, jobId):
    for i in range (0,len(saved_jobs)):
        if(saved_jobs[i] == None):
            continue
        job = int (saved_jobs[i])
        if jobId == job:
            return True
    return False

# Helper function to remove job from saved jobs
def removeId(jobId, saved_jobs):
    for i in range(len(saved_jobs)):
        if saved_jobs[i] == jobId:
            del saved_jobs[i]
            return True
    return False
                
# Run Flask app
if __name__ == '__main__':
    PORT = 8080
    app.run(host='localhost', port=PORT,debug=True)