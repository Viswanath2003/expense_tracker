from flask import Flask, request, jsonify, send_from_directory
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import config
from flask import redirect
import os

app = Flask(__name__, static_folder='.', static_url_path='')
app.config.from_object(config.Config)
CORS(app)
mysql = MySQL(app)


@app.route('/')
def home():
    return send_from_directory('.', 'index.html')


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    salary = data.get('salary')
    username = data.get('username')
    # CRITICAL: Hash the password before insertion
    password = generate_password_hash(data.get('password'))

    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO users (name, salary, username, password) VALUES (%s, %s, %s, %s)",
                   (name, salary, username, password))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'User registered successfully!'}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    cursor = mysql.connection.cursor()
    # Fetch all user columns
    cursor.execute("SELECT id, name, salary, username, password FROM users WHERE username=%s", (username,))
    user = cursor.fetchone()
    cursor.close() # Close the cursor immediately after fetching

    # Check if user exists and verify password hash
    if user and check_password_hash(user['password'], password):
        
        # CRITICAL FIX: Construct a new dictionary excluding the password hash
        user_data = {
            'id': user['id'],
            'name': user['name'],
            'salary': float(user['salary']),
            'username': user['username']
        }
        
        return jsonify({'message': 'Login successful', 'user': user_data}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/api/expenses/<int:user_id>', methods=['GET'])
def get_expenses(user_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM expenses WHERE user_id=%s", (user_id,))
    expenses = cursor.fetchall()
    cursor.close()
    return jsonify(expenses)


@app.route('/api/expenses', methods=['POST'])
def add_expense():
    data = request.get_json()
    user_id = data.get('user_id')
    name = data.get('name')
    amount = data.get('amount')

    cursor = mysql.connection.cursor()
    cursor.execute("INSERT INTO expenses (user_id, name, amount) VALUES (%s, %s, %s)", (user_id, name, amount))
    mysql.connection.commit()
    cursor.close()
    return jsonify({'message': 'Expense added successfully!'}), 201

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"}), 200



if __name__ == '__main__':
    # Flask is running on 0.0.0.0:5000 inside the container
    app.run(host='0.0.0.0', port=5000)
