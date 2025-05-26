import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='',
    database='airhost_db'
)

cursor = conn.cursor()

def create_user(firstname, lastname, gender, birth, email, role, password, original, avatar):
    # Insert query
    sql = "INSERT INTO users (firstname, lastname, gender, birth, email, role, password, original, avatar) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    values = (firstname, lastname, gender, birth, email, role, password, original, avatar)

    cursor.execute(sql, values)
    conn.commit()  # save changes

    print("Inserted", cursor.rowcount, "row(s).")

def get_users():
    sql = "SELECT * FROM users"
    cursor.execute(sql)
    users = cursor.fetchall()
    return users

def edit_user(id, firstname, lastname, gender, birth, email, role, original, avatar):
    # edit query
    if avatar:
        sql = """
        UPDATE users
        SET firstname = %s,
            lastname = %s,
            gender = %s,
            birth = %s,
            email = %s,
            role = %s,
            original = %s,
            avatar = %s
        WHERE id = %s
        """
        values = (firstname, lastname, gender, birth, email, role, original, avatar, id)
    else:
        sql = """
        UPDATE users
        SET firstname = %s,
            lastname = %s,
            gender = %s,
            birth = %s,
            email = %s,
            role = %s
        WHERE id = %s
        """
        values = (firstname, lastname, gender, birth, email, role, id)
    
    cursor.execute(sql, values)
    conn.commit()  # save changes

    print("Inserted", cursor.rowcount, "row(s).")

def del_user(id):
    sql = "DELETE FROM users WHERE id = %s"
    values = (id,)
    cursor.execute(sql, values)
    conn.commit()

def login_user(email, password):
    sql = "SELECT * FROM users WHERE email = %s "
    values = (email,)

    cursor.execute(sql, values)
    user = cursor.fetchone()
    print(user)
    if user is None:
        return 101  # User not found
    elif user[7] == password:
        return user
    else:
        return 102