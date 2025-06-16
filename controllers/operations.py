from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

# Get the path from the environment and set it for Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Now you can safely use BigQuery
from google.cloud import bigquery
client = bigquery.Client()

def operation_not_exist(data):
    client = bigquery.Client()

    query = f"""
        SELECT COUNT(*) as count
        FROM `airhostbooking-461314.airhost.operations`
        WHERE roomId = '{data["roomId"]}' and year = {data["year"]} and month = {data["month"]}
    """
    query_job = client.query(query)
    result = query_job.result()
    
    row = list(result)[0]
    if row["count"] > 0:
        return False
    else:
        return True

def insert_operations(operations):
    for operation in operations:
        if operation_not_exist(operation):
            # Get the next available ID
            table_id = "airhostbooking-461314.airhost.operations"
            
            query = """
                SELECT COUNT(*) as total
                FROM `airhostbooking-461314.airhost.operations`
            """
            next_id = 1
            # Run the query
            query_job = client.query(query)
            result = query_job.result()
            print(result)
            if result.total_rows == 0:
                next_id = 1
                print("The reservations table is empty.")
            else:
                query = """
                    SELECT IFNULL(MAX(id), 0) + 1 AS next_id
                    FROM `airhostbooking-461314.airhost.operations`
                """
                next_id = list(client.query(query))[0].next_id
                print(f"Next available ID: {next_id}")

            # Prepare the insert statement
            operation["id"] = next_id
            rows_to_insert = [operation]

            errors = client.insert_rows_json(table_id, rows_to_insert)

            if errors:
                print("Insert failed:", errors)
            else:
                print("Operation inserted successfully.")
        else:
            query = f"""
                UPDATE `airhostbooking-461314.airhost.operations`
                SET roomId = '{operation["roomId"]}', year = {operation["year"]}, month = {operation["month"]}, sum = {operation["sum"]}, monthly = {operation["monthly"]}, bnb = {operation["bnb"]}
                WHERE roomId = '{operation["roomId"]}' and year = {operation["year"]} and month = {operation["month"]}
            """
            client.query(query).result()
            print("This booking is already exists. updated.")
    return({"status": "success", "message": "successfully added"})
