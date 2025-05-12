from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
from job_fetcher import fetch_job_opportunities
from compatibility_calculator import compare_requirements
import os
import psycopg2
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from datetime import datetime

# Database connection
conn = psycopg2.connect(
        host="localhost",
        database="matchIt",
        user="postgres",
        password="12345678",
        port="5433"
)
cur = conn.cursor()

# Initialize Flask app
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "your_secret_key"
jwt = JWTManager(app)

@app.route('/jobs', methods=['POST'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def jobs():
    try:
        # Parse JSON data from the request
        data = request.get_json()

        role = data.get('role')
        company = data.get('company')
        date = data.get('date')
        job_type = data.get('jobType')

        # Validate role field
        if not role:
            return jsonify({"error": "Role cannot be null"}), 400

        # Fetch job opportunities with filters applied
        jobs = fetch_job_opportunities(role=role, company=company, date=date, job_type=job_type)

        return jsonify(jobs)

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/compatibility', methods=['POST'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def compatibility():
    try:
        # Parse JSON data from the request
        data = request.get_json()
        
        if not data or 'file_content' not in data or 'job_description' not in data:
            return jsonify({"error": "Missing file_content or job_description"}), 400
        
        resume_text = data['file_content']
        job_description = data['job_description']
        
        # Compare similarity
        match_percentage = compare_requirements(resume_text, job_description)
        
        return jsonify({"match_percentage": match_percentage})
    except Exception as e:
        #print(f"Error: {e}")
        return jsonify({"error": "An error occurred while processing the request"}), 500

@app.route('/signin', methods=['POST'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def signin():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    cur.execute("SELECT EXISTS(SELECT 1 FROM users WHERE email = %s)", (email,))
    if(cur.fetchone()[0]==True):
        cur.execute("SELECT password FROM users WHERE email = %s", (email,))
        db_password = cur.fetchone()[0]
        if(db_password==password):
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            db_id = cur.fetchone()[0]
            access_token = db_id
            return jsonify(access_token=access_token), 200
        else:
            return jsonify({"status": "error", "message": "Wrong email or password, try again"}), 401
    else:
        return jsonify({"status": "error", "message": "Wrong email or password, try again"}), 401

@app.route('/signup', methods=['POST'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def signup():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    if not email or not password or not username:
        return jsonify({"status": "error", "message": "All fields are required"}), 400

    cur.execute("SELECT EXISTS(SELECT 1 FROM users WHERE email = %s)", (email,))
    if cur.fetchone()[0]:
        return jsonify({"status": "error", "message": "Email already exists"}), 409

    cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, password))
    conn.commit()

    return jsonify({"status": "success", "message": "User registered successfully"}), 201

@app.route('/save', methods=['POST'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def saveJob():
    data = request.get_json()

    title = data.get('title')
    company = data.get('company')
    location = data.get('location')
    postedDate = data.get('postedDate')
    deadline = data.get('deadline')
    jobUrl = data.get('jobUrl')
    jobId = data.get('jobId')
    #print(f"Title: {title}, Company: {company}, Location: {location}, Posted Date: {postedDate}, Deadline: {deadline}, Job URL: {jobUrl}, Job ID: {jobId}")

    cur.execute("SELECT EXISTS(SELECT 1 FROM jobs WHERE specific_id = %s)", (jobId,))
    if(cur.fetchone()[0]==False):
        try:
            cur.execute("INSERT INTO jobs (title,organization,location,date_posted,deadline, url, specific_id) VALUES (%s, %s, %s,%s,%s,%s,%s)", (title, company, location, postedDate, deadline, jobUrl, jobId))
            conn.commit()
        except Exception as e:
            return jsonify({"status": "error", "message": "Error adding job to saved list"}), 500
        
    user_id = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
    cur.execute("SELECT saved_jobs from users WHERE id = %s", (user_id,))
    saved_jobs = cur.fetchall()
    print("Saved jobs before addition:", saved_jobs)
    if(jobExists(saved_jobs[0][0],jobId)==False):
        try:
            saved_jobs[0][0].append(int(jobId))
            print("Saved jobs after addition:", saved_jobs)
            cur.execute("UPDATE users SET saved_jobs = %s WHERE id = %s", (saved_jobs[0][0], user_id))
            conn.commit()
            return jsonify({"status": "success", "message": "Job saved successfully"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": "Error saving job"}), 500
    elif(jobExists(saved_jobs,jobId)==True):
        return jsonify({"status": "error", "message": "Job already exists"}), 401

@app.route('/savedinfo', methods=['GET'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def getSavedInfo():
        try:
            user_id = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
            print("user_id",user_id)
            cur.execute("SELECT saved_jobs from users WHERE id = %s", (user_id,))
            saved_jobs = cur.fetchall()
            print("user_id",saved_jobs[0])
            if  len(saved_jobs[0])==1:
                print("user_id",user_id)
                try:
                    cur.execute("SELECT resume, time_uploaded from users WHERE id = %s", (user_id,))
                    resume = cur.fetchall()
                    print(resume)
                    if  resume[0][0] == None:
                        
                        return jsonify({"error":"No saved jobs","error2": "No Resume Found"}), 200
                    else:
                        resume_text = resume[0][0]
                        uploaded_time = resume[0][1]
                        #print("resume",resume_text)
                        #print("uploaded_time",uploaded_time)
                        return jsonify({"error":"No saved jobs","resume": resume_text, "uploaded_time": uploaded_time}), 200
                except Exception as e:
                    return jsonify({"error": f"An error occurred: {str(e)}"}), 500 
                  
            jobs_list = []
            for job_id in saved_jobs[0][0]:
                cur.execute("SELECT title, organization, location, date_posted, deadline, url, specific_id FROM jobs WHERE specific_id = %s", (str(job_id),))
                job = cur.fetchone()
                #print(cur.fetchone())
                if job:
                    jobs_list.append({
                        "title": job[0],
                        "organization": job[1],
                        "location": job[2],
                        "date_posted": job[3],
                        "deadline": job[4],
                        "url": job[5],
                        "specific_id": job[6]
                    })
            cur.execute("SELECT resume, time_uploaded from users WHERE id = %s", (user_id,))
            resume = cur.fetchall()
            if  resume[0][0] == None:
                return jsonify({"jobs_saved":jobs_list,"error2": "No Resume Found"}), 200
            else:
                resume_text = resume[0][0]
                uploaded_time = resume[0][1]
                return jsonify({"jobs_saved":jobs_list,"resume": resume_text, "uploaded_time": uploaded_time}), 200
            
        except Exception as e:
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/unsave', methods=['POST'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def unsaveJob():
    data = request.get_json()
    jobId = data.get('jobId')
    #print("Job ID to unsave:", jobId)
    user_id = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
    try:
        cur.execute("SELECT saved_jobs from users WHERE id = %s", (user_id,))
        saved_jobs = cur.fetchall()[0][0]
        print("Saved jobs before removal:", saved_jobs)
        if(removeId(int(jobId),saved_jobs)==True):
            print("Saved jobs after removal:", saved_jobs)
            
            cur.execute("UPDATE users SET saved_jobs = %s WHERE id = %s", (saved_jobs, user_id))
            conn.commit()
            return jsonify({"status": "success", "message": "Job unsaved successfully"}), 200
        
    except Exception as e:
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/uploadresume', methods=['POST'])
@cross_origin(origin='127.0.0.1', ports=[3000, 3001])
def saveResume():
    data = request.get_json()
    resume = data.get('file_content')
    time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    user_id = request.headers.get("Authorization").split(" ")[1] if "Authorization" in request.headers else None
    try:
        cur.execute("UPDATE users SET resume = %s, time_uploaded = %s WHERE id = %s", (resume, time, user_id))
        conn.commit()
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
    app.run(host='127.0.0.1', port=PORT,debug=True)