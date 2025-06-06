#!/bin/bash

# Example bash script for file operations
# Usage: file_operations.sh [directory] [pattern]

DIRECTORY=${1:-"/tmp"}
PATTERN=${2:-"*"}

echo "=== File Operations Script ==="
echo "Directory: $DIRECTORY"
echo "Pattern: $PATTERN"
echo "Date: $(date)"
echo ""

# Check if directory exists
if [ ! -d "$DIRECTORY" ]; then
    echo "Error: Directory '$DIRECTORY' does not exist!"
    exit 1
fi

echo "=== Directory Contents ==="
ls -la "$DIRECTORY"
echo ""

echo "=== Files matching pattern '$PATTERN' ==="
find "$DIRECTORY" -name "$PATTERN" -type f 2>/dev/null | head -20
echo ""

echo "=== Directory Size ==="
du -sh "$DIRECTORY"
echo ""

echo "=== File Count by Type ==="
find "$DIRECTORY" -type f 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -nr | head -10
echo ""

echo "=== Recently Modified Files (Last 24 hours) ==="
find "$DIRECTORY" -type f -mtime -1 2>/dev/null | head -10
echo ""

echo "=== Largest Files ==="
find "$DIRECTORY" -type f -exec ls -lh {} \; 2>/dev/null | sort -k5 -hr | head -10
echo ""

echo "File operations completed successfully!"
