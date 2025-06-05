from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

# Get the path from the environment and set it for Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Now you can safely use BigQuery
from google.cloud import bigquery
client = bigquery.Client()

# Your query
query = """
    SELECT * FROM `airhostbooking-461314.airhost.users`
"""

# Run the query
query_job = client.query(query)

results = [dict(row) for row in query_job]

print("Query results:", results)


query = """
INSERT INTO `airhostbooking-461314.airhost.users`
(id, firstname, lastname, gender, birth, email, role, password, avatar)
VALUES (@id, @firstname, @lastname, @gender, @birth, @email, @role, @password, @avatar)
"""

job_config = bigquery.QueryJobConfig(
    query_parameters=[
        bigquery.ScalarQueryParameter("id", "INT64", 1),
        bigquery.ScalarQueryParameter("firstname", "STRING", "John"),
        bigquery.ScalarQueryParameter("lastname", "STRING", "Doe"),
        bigquery.ScalarQueryParameter("gender", "STRING", "Male"),
        bigquery.ScalarQueryParameter("birth", "STRING", "1990-01-01"),
        bigquery.ScalarQueryParameter("email", "STRING", "john@example.com"),
        bigquery.ScalarQueryParameter("role", "STRING", "user"),
        bigquery.ScalarQueryParameter("password", "STRING", "hashedpassword"),
        bigquery.ScalarQueryParameter("avatar", "STRING", "https://example.com/avatar.jpg"),
    ]
)

query_job = client.query(query, job_config=job_config)
query_job.result()  # Wait for the job to complete
