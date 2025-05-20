import numpy as np
from sentence_transformers import SentenceTransformer, util

# Load a pretrained Sentence-BERT model
model = SentenceTransformer("all-MiniLM-L6-v2")

def compare_requirements(resume_text, job_description):
    # Encode the resume and job description into embeddings
    resume_embedding = model.encode(resume_text)
    job_embedding = model.encode(job_description)

    # Compute cosine similarity using Sentence-BERT embeddings
    similarity_score = util.cos_sim(resume_embedding, job_embedding)

    return round(similarity_score.item() * 100, 2)

