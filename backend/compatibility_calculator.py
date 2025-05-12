import numpy as np
import math
from sklearn.feature_extraction.text import TfidfVectorizer

def compare_requirements(resume_text, job_description):
    # TF-IDF Vectorization
    tfidf_vectorizer = TfidfVectorizer()
    tfidf_matrix = tfidf_vectorizer.fit_transform([resume_text, job_description])

    # Convert sparse matrices to dense numpy arrays
    vector1 = tfidf_matrix[0].toarray()[0]
    vector2 = tfidf_matrix[1].toarray()[0]

    # Compute cosine similarity
    similarity = cosine_similarity(vector1, vector2)
    return round(similarity * 100, 2)

def cosine_similarity(vectorA, vectorB):
    dot_product = np.dot(vectorA, vectorB)
    magnitudeA = math.sqrt(np.dot(vectorA, vectorA))
    magnitudeB = math.sqrt(np.dot(vectorB, vectorB))

    if magnitudeA*magnitudeB == 0:
        return 0.0  # Avoid division by zero

    return dot_product / (magnitudeA * magnitudeB)