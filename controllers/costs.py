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
