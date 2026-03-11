#!/bin/bash

# Default port
PORT=8080

# Find an available port
while lsof -i :$PORT >/dev/null 2>&1; do
    echo "Port $PORT is in use, trying next port..."
    PORT=$((PORT+1))
done

# Find the local IP address on macOS (usually en0 for Wi-Fi, en1 for sometimes Ethernet/other)
LOCAL_IP=$(ipconfig getifaddr en0)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1)
fi

echo "====================================================="
echo "🌐 Starting web server for English Kids App..."
echo ""
echo "💻 Local access: http://localhost:$PORT"
if [ -n "$LOCAL_IP" ]; then
    echo "📱 LAN access (for other devices): http://$LOCAL_IP:$PORT"
fi
echo ""
echo "🛑 Press Ctrl+C to stop the server."
echo "====================================================="

# Run Python's built-in HTTP server, binding to 0.0.0.0 to allow LAN access
python3 -m http.server $PORT --bind 0.0.0.0
