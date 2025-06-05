from dotenv import load_dotenv
import os

# Load .env variables
load_dotenv()

# Get the path from the environment and set it for Google credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

# Now you can safely use BigQuery
from google.cloud import bigquery
client = bigquery.Client()

def check_email_not_exists(email):
    client = bigquery.Client()

    query = """
        SELECT COUNT(*) as total
        FROM `airhostbooking-461314.airhost.users`
        WHERE email = @user_email
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_email", "STRING", email)
        ]
    )

    query_job = client.query(query, job_config=job_config)
    result = query_job.result()
    
    row = next(result)
    return row.total == 0  # Returns True if email does not exist


def create_user(firstname, lastname, gender, birth, email, role, password, original, avatar):
    if check_email_not_exists(email):
        # Get the next available ID
        table_id = "airhostbooking-461314.airhost.users"
        
        query = """
            SELECT COUNT(*) as total
            FROM `airhostbooking-461314.airhost.users`
        """
        next_id = 1
        # Run the query
        query_job = client.query(query)
        result = query_job.result()

        if result.total_rows == 0:
            next_id = 1
            print("The users table is empty.")
        else:
            query = """
                SELECT IFNULL(MAX(id), 0) + 1 AS next_id
                FROM `airhostbooking-461314.airhost.users`
            """
            next_id = list(client.query(query))[0].next_id
            print(f"Next available ID: {next_id}")

        # Prepare the insert statement
        rows_to_insert = [{
            "id": next_id,
            "firstname": firstname,
            "lastname": lastname,
            "gender": gender,
            "birth": birth,
            "email": email,
            "role": role,
            "password": password,
            "avatar": avatar
        }]

        errors = client.insert_rows_json(table_id, rows_to_insert)

        if errors:
            print("Insert failed:", errors)
            return({"status": "error", "message": "Insert failed", "errors": errors})
        else:
            print("User inserted successfully.")
            return({"status": "success", "message": "正確に登録されました。ログインしてください。"})
    else:
        print("Email already exists. User not created.")
        return({"status": "error", "message": "すでに存在するメールアドレスです。"})

def get_users():
    query = "SELECT * FROM `airhostbooking-461314.airhost.users`"
    query_job = client.query(query)

    results = query_job.result()  # Wait for query to finish
    users = [dict(row) for row in results]  # Convert rows to list of dicts

    return users

def edit_user(id, firstname, lastname, gender, birth, email, role, original, avatar):
    table = "`airhostbooking-461314.airhost.users`"

    if avatar:
        query = f"""
        CREATE OR REPLACE TABLE {table} AS
        SELECT
            id,
            IF(id = @id, @firstname, firstname) AS firstname,
            IF(id = @id, @lastname, lastname) AS lastname,
            IF(id = @id, @gender, gender) AS gender,
            IF(id = @id, @birth, birth) AS birth,
            IF(id = @id, @email, email) AS email,
            IF(id = @id, @role, role) AS role,
            password,
            IF(id = @id, @avatar, avatar) AS avatar
        FROM {table}
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("id", "INT64", id),
                bigquery.ScalarQueryParameter("firstname", "STRING", firstname),
                bigquery.ScalarQueryParameter("lastname", "STRING", lastname),
                bigquery.ScalarQueryParameter("gender", "STRING", gender),
                bigquery.ScalarQueryParameter("birth", "STRING", birth),
                bigquery.ScalarQueryParameter("email", "STRING", email),
                bigquery.ScalarQueryParameter("role", "STRING", role),
                bigquery.ScalarQueryParameter("avatar", "STRING", avatar),
            ]
        )
    else:
        query = f"""
        CREATE OR REPLACE TABLE {table} AS
        SELECT
            id,
            IF(id = @id, @firstname, firstname) AS firstname,
            IF(id = @id, @lastname, lastname) AS lastname,
            IF(id = @id, @gender, gender) AS gender,
            IF(id = @id, @birth, birth) AS birth,
            IF(id = @id, @email, email) AS email,
            IF(id = @id, @role, role) AS role,
            password,
            avatar
        FROM {table}
        """

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("id", "INT64", id),
                bigquery.ScalarQueryParameter("firstname", "STRING", firstname),
                bigquery.ScalarQueryParameter("lastname", "STRING", lastname),
                bigquery.ScalarQueryParameter("gender", "STRING", gender),
                bigquery.ScalarQueryParameter("birth", "STRING", birth),
                bigquery.ScalarQueryParameter("email", "STRING", email),
                bigquery.ScalarQueryParameter("role", "STRING", role),
            ]
        )


    query_job = client.query(query, job_config=job_config)
    query_job.result()

    print("User with ID", id, "was updated.")

def del_user(id):

    query = """
    CREATE OR REPLACE TABLE `airhostbooking-461314.airhost.users` AS
    SELECT * FROM `airhostbooking-461314.airhost.users` WHERE id != @id;
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("id", "INT64", id)
        ]
    )

    query_job = client.query(query, job_config=job_config)
    query_job.result()  # Wait for completion

    print(f"Deleted user with ID: {id}")

def login_user(email, password):
    
    client = bigquery.Client()

    # Query to fetch user by email
    query = """
        SELECT * FROM `airhostbooking-461314.airhost.users`
        WHERE email = @user_email
        LIMIT 1
    """

    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("user_email", "STRING", email)
        ]
    )

    query_job = client.query(query, job_config=job_config)
    results = query_job.result()

    user = None
    for row in results:
        user = dict(row)
        break
    if user is None:
        return 101  # User not found
    elif user.get("password") == password:
        return user  # Login success
    else:
        return 102  # Password incorrect