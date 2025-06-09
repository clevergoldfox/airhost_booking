import sys
import threading
import eventlet
import eventlet.wsgi
from flask import Flask, Response, send_from_directory, render_template, request, send_file, jsonify
import pandas as pd
from datetime import datetime
import time
import os
import glob
import csv
import re
import json

from controllers.users import create_user, get_users, edit_user, del_user, login_user 
# from controllers.costs import create_cost, get_costs

# -------------------------------
# Flask Application Definition
# -------------------------------
flask_app = Flask(__name__)

@flask_app.route('/')
def index():
    return render_template('index.html')

# =================== start login-user ========================

@flask_app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = login_user(email, password)
        if user == 102:
            return {'code': '102', 'message': '間違ったパスワードです。正確に入力してください。'}
        elif user == 101:
            return {'code': '101', 'message': 'メールアドレスが存在しません。'}
        else:
            return {'code': '100', 'data': user, 'message': '正確にログインしました。'}
    if request.method == 'GET':
        return render_template('login.html')

# =================== end login-user ========================


# =================== start users-data manage ========================

@flask_app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        print("request data", request.form)
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        gender = request.form['gender']
        birth = request.form['birth']
        email = request.form['email']
        print("firstname", firstname)
        print("lastname", lastname)
        print("gender", gender)
        print("birth", birth)
        print("email", email)
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
        result = create_user(firstname, lastname, gender, birth, email, role, password, original, avatar)

        return jsonify(result)
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

# =================== end users-data manage ========================

# =================== start operation-data manage ========================

@flask_app.route('/operation', methods=['GET', 'POST'])
def operation():
    if request.method == 'POST':
        try:
            file = request.files['datafile']

            excel_data = pd.read_excel(file, sheet_name=None)
            # Columns to extract
            print(excel_data)
            columns_to_extract = ['部屋番号', 'マンスリー+民泊', 'マンスリー', '民泊使用日数']

            ope_data = {}
            for sheet_name, df in excel_data.items():
                existing_cols = [col for col in columns_to_extract if col in df.columns]
                if existing_cols:
                    df = df.where(pd.notnull(df), None)
                    exclude_indices = {17, 18, 19, 20}
                    ope_data[sheet_name] = [item for idx, item in enumerate(df[existing_cols].values.tolist()[:27]) if idx not in exclude_indices]

            return jsonify({'status': 'success', 'data': json.dumps(ope_data, ensure_ascii=False)})
        except Exception as e:
            return jsonify({'status': 'success', 'data': json.dumps(e)})



# =================== end operation-data manage ========================

# =================== start reservation-data manage ========================

@flask_app.route('/reservation', methods=['GET', 'POST'])
def reservation():
    if request.method == 'POST':
        try:
            file = request.files['datafile']

            pre_data = []
            file.stream.seek(0)  # reset file pointer
            file_content = csv.reader(file.stream.read().decode('utf-8-sig').splitlines())

            return jsonify({'status': 'success', 'data': list(file_content)})
        except Exception as e:
            return jsonify({'status': 'success', 'data': list([])})

    return render_template('reservation.html')
    if request.method == 'GET':
        return render_template('reservation.html')

# =================== end reservation-data manage ========================

# =================== start cost-data manage ========================

@flask_app.route('/cost', methods=['GET', 'POST'])
def cost():
    if request.method == 'POST':
        try:
            # print("request data", request)
            data = request.form.to_dict()  # Convert form data to a dictionary
            # print("data", request.to_dict())
            print(data)
            # # print("josn  request data", data)
            # print("Headers:", request.headers)
            # print("Content-Type:", request.content_type)
            # print("Form data:", request.form["NC1001"])
            # print("Raw data:", request.data)

            return jsonify({'status': 'success', 'data': json.dumps(data, ensure_ascii=False, default=str)})
        except Exception as e:
            print(str(e))
            return jsonify({'status': 'error', 'message': str(e)})
    if request.method == 'GET':
        return render_template('cost.html')

@flask_app.route('/newcost', methods=['GET', 'POST'])
def newcost():
    if request.method == 'POST':
        try:
            # print("request data", request)
            data = request.form
            # print("josn  request data", data)
            print("Headers:", request.headers)
            print("Content-Type:", request.content_type)
            print("Form data:", request.form.to_dict())
            print("Raw data:", request.data)

            return jsonify({'status': 'success', 'data': json.dumps(data, ensure_ascii=False, default=str)})
        except Exception as e:
            print(str(e))
            return jsonify({'status': 'error', 'message': str(e)})
            # return render_template('cost.html')
    if request.method == 'GET':
        return render_template('cost.html')

@flask_app.route('/cost-file', methods=['GET', 'POST'])
def cost_file():
    if request.method == 'POST':
        try:
            # file = request.files['datafile']
            # df = pd.read_excel(file, sheet_name="価格20250218")  # Read all sheets
            # data = df.to_dict(orient='records')
            # for item in data:
            #     print(item)
            # print(data)
            # return jsonify({'status': 'success', 'data': "data"})

            file = request.files['datafile']
            file_content = pd.read_excel(file, sheet_name=None)  # Read all sheets
            cost_data = {}

            for sheet_name, df in file_content.items():
                if not df.empty and "価格" in sheet_name:
                    df = df.where(pd.notnull(df), None)
                    header = df.columns.tolist()
                    rows = df.values.tolist()[:25]
                    cost_data[sheet_name] = [header] + rows
            # for key, value in cost_data.items():
            #     print(f"{key}")
            print(cost_data)
            return jsonify({'status': 'success', 'data': json.dumps(cost_data[next(iter(cost_data))], ensure_ascii=False, default=str)})

        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)})

    return render_template('cost.html')
# =================== end cost-data manage ========================



# =================== Boot server ========================

if __name__ == "__main__":
    flask_app.run(host="127.0.0.1", port=80, debug=False, use_reloader=False)
