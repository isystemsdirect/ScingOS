#!/bin/bash

# ScingOS Local Development Server Script
# Starts both client and Firebase emulators

set -e

echo "================================================"
echo "  Starting ScingOS Development Environment"
echo "================================================"
echo ""

# Check if tmux is available
if command -v tmux &> /dev/null; then
    echo "🚀 Starting with tmux (use Ctrl+B then D to detach)..."
    
    # Create new tmux session
    tmux new-session -d -s scingos
    
    # Split window horizontally
    tmux split-window -h
    
    # Run client in first pane
    tmux send-keys -t scingos:0.0 'cd client && npm run dev' C-m
    
    # Run Firebase emulators in second pane
    tmux send-keys -t scingos:0.1 'cd cloud/functions && npm run serve' C-m
    
    # Attach to session
    tmux attach-session -t scingos
else
    echo "⚠️  tmux not found. Starting in sequential mode..."
    echo "💡 Install tmux for parallel execution: brew install tmux (macOS) or apt-get install tmux (Linux)"
    echo ""
    
    # Start client in background
    echo "🌐 Starting client on http://localhost:3000..."
    cd client
    npm run dev &
    CLIENT_PID=$!
    cd ..
    
    # Wait a bit
    sleep 2
    
    # Start Firebase emulators
    echo "🔥 Starting Firebase emulators..."
    cd cloud/functions
    npm run serve
    
    # Kill client when emulators exit
    kill $CLIENT_PID
fi