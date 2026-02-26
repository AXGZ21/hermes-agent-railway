#!/bin/bash
set -e

echo "========================================="
echo "  Hermes Agent - Starting up..."
echo "========================================="

# Use Railway PORT or default
export PORT="${PORT:-8000}"

echo "Port: $PORT"
echo "Database: ${DATABASE_PATH:-/app/data/hermes.db}"

# Initialize database
python -c "
import sys
sys.path.insert(0, '/app')
from web.backend.api.database.db import init_db
init_db()
print('Database initialized.')
"

# Enable Telegram gateway if token is set
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    echo "Telegram bot token found - enabling gateway..."
    sed -i 's/autostart=false/autostart=true/' /etc/supervisor/conf.d/supervisord.conf
else
    echo "No Telegram bot token - gateway disabled."
fi

echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
