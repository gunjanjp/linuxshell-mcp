#!/bin/bash

# Universal Linux system monitoring script
# Works on Ubuntu, Debian, Fedora, openSUSE, and other distributions
# Can be created and executed using the Linux Bash MCP server

echo "=== Linux System Information ==="
echo "Date: $(date)"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime)"
echo ""

echo "=== Operating System ==="
if [ -f /etc/os-release ]; then
    echo "Distribution Information:"
    cat /etc/os-release
elif [ -f /etc/redhat-release ]; then
    echo "Red Hat-based system:"
    cat /etc/redhat-release
elif [ -f /etc/debian_version ]; then
    echo "Debian-based system:"
    cat /etc/debian_version
else
    echo "OS: $(uname -s)"
fi
echo ""

echo "=== Kernel Information ==="
uname -a
echo ""

echo "=== CPU Information ==="
if command -v lscpu > /dev/null 2>&1; then
    lscpu | head -15
else
    echo "CPU: $(cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d: -f2 | xargs)"
    echo "Cores: $(nproc)"
fi
echo ""

echo "=== Memory Usage ==="
if command -v free > /dev/null 2>&1; then
    free -h
else
    echo "Memory info:"
    cat /proc/meminfo | head -3
fi
echo ""

echo "=== Disk Usage ==="
df -h 2>/dev/null | grep -E '^/dev|^tmpfs' | head -10
echo ""

echo "=== Network Interfaces ==="
if command -v ip > /dev/null 2>&1; then
    ip addr show | grep -E "^[0-9]+:|inet " | head -20
elif command -v ifconfig > /dev/null 2>&1; then
    ifconfig | grep -E "^[a-z]|inet " | head -20
else
    echo "Network tools not available"
fi
echo ""

echo "=== Running Processes (Top 10 by CPU) ==="
if command -v ps > /dev/null 2>&1; then
    ps aux 2>/dev/null | head -1
    ps aux 2>/dev/null | sort -k3 -nr | head -10
else
    echo "ps command not available"
fi
echo ""

echo "=== System Load ==="
if [ -f /proc/loadavg ]; then
    echo "Load average: $(cat /proc/loadavg)"
else
    uptime | grep -o 'load average.*'
fi
echo ""

echo "=== Logged in Users ==="
if command -v who > /dev/null 2>&1; then
    who
elif command -v w > /dev/null 2>&1; then
    w | head -5
else
    echo "User info commands not available"
fi
echo ""

echo "=== Environment ==="
echo "Shell: $SHELL"
echo "User: $(whoami)"
echo "Home: $HOME"
echo "Path: $PATH" | head -c 200
echo "..."
echo ""

echo "=== Package Manager Info ==="
if command -v apt > /dev/null 2>&1; then
    echo "Debian/Ubuntu system (apt)"
    echo "Installed packages: $(dpkg -l | wc -l)"
elif command -v yum > /dev/null 2>&1; then
    echo "Red Hat/CentOS system (yum)"
    echo "Installed packages: $(yum list installed 2>/dev/null | wc -l)"
elif command -v dnf > /dev/null 2>&1; then
    echo "Fedora system (dnf)"
    echo "Installed packages: $(dnf list installed 2>/dev/null | wc -l)"
elif command -v zypper > /dev/null 2>&1; then
    echo "openSUSE system (zypper)"
    echo "Installed packages: $(zypper search -i 2>/dev/null | wc -l)"
elif command -v pacman > /dev/null 2>&1; then
    echo "Arch Linux system (pacman)"
    echo "Installed packages: $(pacman -Q | wc -l)"
elif command -v apk > /dev/null 2>&1; then
    echo "Alpine Linux system (apk)"
    echo "Installed packages: $(apk list -I 2>/dev/null | wc -l)"
else
    echo "No known package manager found"
fi
echo ""

echo "Script completed successfully at $(date)!"
