#!/bin/bash
# Wait for the database server to be ready
echo "Waiting for MySQL to start..."
until mysql -h "database-service" -u "expense_user" -p"Charan@2003" -e "SELECT 1"; do
  echo "MySQL is unavailable - sleeping"
  sleep 1
done

echo "MySQL is up - executing schema creation"

# Execute the SQL script
mysql -h "database-service" -u "expense_user" -p"Charan@2003" < /docker-entrypoint-initdb.d/db.sql

echo "Database initialization complete."