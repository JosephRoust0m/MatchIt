import requests

def fetch_job_opportunities(role="", company="", date="", job_type=""):

    base_url = "https://linkedin-job-search-api.p.rapidapi.com/active-jb-7d"
    params = {
        "limit": 100,
        "offset": 0,
        "title_filter": role,
        "location_filter": "Canada"
    }
    
    # Add optional filters
    if date:
        params["date_filter"] = date+"T00:00:00"
    if job_type:
        if job_type != "Remote":
            params["ai_work_arrangement_filter"] = job_type
        else:
            params["ai_work_arrangement_filter"] = job_type + " OK"
    if company:
        params["organization_filter"] = company
    
    #params["advanced_organization_filter"] = None

    headers = {
        "X-RapidAPI-Key": "131f763929mshdf8ccf8216da181p191e2ajsn11cfb0b7bd7d", 
        "X-RapidAPI-Host": "linkedin-job-search-api.p.rapidapi.com"
    }
    
    try:
        print("Fetching job opportunities with filters:", headers, params)
        response = requests.get(base_url, headers=headers, params=params)
        response.raise_for_status()  
        
        data = response.json()
        return data
    
    except requests.RequestException as error:
        print("Error fetching job opportunities:", error)
        return []
