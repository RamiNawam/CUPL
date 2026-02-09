#!/bin/bash

# Start the backend with database password
# Usage: ./start-backend.sh [password]
# If no password provided, it will prompt

if [ -z "$1" ]; then
    echo "Please enter your PostgreSQL password:"
    read -s DB_PASSWORD
    export DB_PASSWORD
else
    export DB_PASSWORD=$1
fi

echo "Starting backend..."
cd "$(dirname "$0")"
mvn spring-boot:run
