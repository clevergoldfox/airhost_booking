import sys
import threading
import eventlet
import eventlet.wsgi
from flask import Flask, Response, send_from_directory, render_template, request, send_file, jsonify
from flask_socketio import SocketIO
import pandas as pd
from datetime import datetime
import time
import os
import glob
import csv
import re

from controllers.users import create_user, get_users, edit_user, del_user, login_user 

# -------------------------------
# Flask Application Definition
# -------------------------------
flask_app = Flask(__name__)

@flask_app.route('/')
def index():
    return render_template('index.html')

@flask_app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = login_user(email, password)
        print(user)
        if user:
            if user == 102:
                return {'code': '102', 'message': 'Incorrect password'}
            return {'code': '100', 'data': user, 'message': 'Login successful'}
        else:
            return {'code': '101', 'message': 'Invalid email or password'}
    if request.method == 'GET':
        return render_template('login.html')

@flask_app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        gender = request.form['gender']
        birth = request.form['birth']
        email = request.form['email']
        role = request.form['role']
        if role:
            role = role.lower()
        else:
            role = 'staff'
        password = request.form['password']
        file = request.files['avatar']
        original = file.filename
        if original:
            now = datetime.now()
            if '.' in original:
                ext = original.rsplit('.', 1)[-1].lower()  # returns 'png'
            else:
                ext = ''
            avatar = now.strftime('%Y%m%d%H%M%S') + f'{int(now.microsecond / 1000):03d}.{ext}'
            file.save(os.path.join("static/img/avatars", avatar))
        else:
            avatar = 'default.png'
        create_user(firstname, lastname, gender, birth, email, role, password, original, avatar)

        return render_template('index.html')
    if request.method == 'GET':
        return render_template('signup.html')


@flask_app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@flask_app.route('/users', methods=['GET', 'POST', 'PUT', 'DELETE'])
def users():
    if request.method == 'PUT':
        id = request.form['id']
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        gender = request.form['gender']
        birth = request.form['birth']
        email = request.form['email']
        role = request.form['role']
        file = request.files['avatar']
        original = file.filename
        if original:
            now = datetime.now()
            if '.' in original:
                ext = original.rsplit('.', 1)[-1].lower()  # returns 'png'
            else:
                ext = ''
            avatar = now.strftime('%Y%m%d%H%M%S') + f'{int(now.microsecond / 1000):03d}.{ext}'
            file.save(os.path.join("static/img/avatars", avatar))
        else:
            avatar = False
        edit_user(id, firstname, lastname, gender, birth, email, role, original, avatar)
        users = get_users()
        return render_template('users.html', users=users)
    if request.method == 'GET':
        users = get_users()
        return users

@flask_app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    del_user(user_id)
    users = get_users()
    return render_template('users.html', users=users)

@flask_app.route('/users-page')
def users_page():
    users = get_users()
    return render_template('users.html', users=users)

@flask_app.route('/reservation', methods=['GET', 'POST'])
def reservation():
    if request.method == 'POST':
        file = request.files['datafile']

        # Read CSV content
        pre_data = []
        file.stream.seek(0)  # reset file pointer
        file_content = csv.reader(file.stream.read().decode('utf-8-sig').splitlines())
        
        # for row in csv_reader:
            # print(row)

        return jsonify({'status': 'success', 'data': list(file_content)})

    return render_template('reservation.html')
    if request.method == 'GET':
        return render_template('reservation.html')


@flask_app.route("/scrape", methods=['POST'])
def scrape():
    # os.system('cls')
    if 'file' not in request.files:
        return {'message': 'No file part'}, 400
    
    file = request.files['file']
    step = request.form['step']
    
    if file.filename == '':
        return {'message': 'No selected file'}, 400
    

    # Read CSV content
    pre_data = []
    file.stream.seek(0)  # reset file pointer
    csv_reader = csv.reader(file.stream.read().decode('utf-8-sig').splitlines())

    for row in csv_reader:
        row_data = row[0].split('\t')
        if(len(row_data) > 2):
            pre_data.append([row_data[0],row_data[2], row_data[3]])
    data = scrape_data(pre_data, step)
    all_data = data[0]
    no_box_data = data[1]
    no_new_data = data[2]
    new_data = data[3]
    
    header = ['商品タイプ','商品名', 'ASIN', '価格','カート価格', '最安値価格']
    
    # Save the data to CSV
    df1 = pd.DataFrame(all_data, columns=header)
    df2 = pd.DataFrame(no_box_data, columns=header)
    df3 = pd.DataFrame(new_data, columns=header)
    df4 = pd.DataFrame(no_new_data, columns=header)

    # Get the current time in a specific format (e.g., "YYYY-MM-DD_HH-MM-SS")
    current_time = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

    # Combine the keyword and current time for the file name
    file_name = f"scraped_data_{current_time}.xlsx"

     # Define the directory to save the file (project_directory/saved_files)
    save_dir = os.path.join(os.getcwd(), 'saved_files')
    
    # Create the directory if it does not exist
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    # Construct the full file path
    file_path = os.path.join(save_dir, file_name)

    # Save the DataFrame to the specified directory
    with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
        df1.to_excel(writer, sheet_name='すべての商品', index=False)
        df2.to_excel(writer, sheet_name='カートがとれていない商品', index=False)
        df3.to_excel(writer, sheet_name='最安値価格がとれていない商品', index=False)
        df4.to_excel(writer, sheet_name='最安値価格がとれてい商品', index=False)
    
    message1 = file_name + " ファイルが"+ save_dir +"に保存されました。"
    message2 = "終了コード:100"
    message3 = "全処理を完了しました."
    messages = [message1, message2, message3]
    # Send the file back to the user
    send_file(file_path, as_attachment=True)
    return [data[0], messages]
    

if __name__ == "__main__":
    flask_app.run(host="127.0.0.1", port=7000, debug=False, use_reloader=False)
