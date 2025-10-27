import os

class Config:
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")
    MYSQL_DB = os.getenv("MYSQL_DB", "expense_tracker")
    MYSQL_CURSORCLASS = 'DictCursor'
    MYSQL_CLIENT_FLAGS = [2048]