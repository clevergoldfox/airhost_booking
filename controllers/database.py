import mysql.connector

# Connect to MySQL
def connect_to_database():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='airhost_db'
    )

    cursor = conn.cursor()
    return conn, cursor