import os

class Config:
    # Read from environment variables, fall back to hardcoded if not set (for safety)
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'expense_user')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'Charan@2003')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'expense_tracker')
    
    # Other configurations
    MYSQL_CURSORCLASS = 'DictCursor'
    SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')