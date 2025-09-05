#!/bin/bash

# Add Node.js runtime to all API routes
find ./app/api -type f -name "route.ts" -exec sh -c '
  if ! grep -q "export const runtime = '\''nodejs'\''" "$1"; then
    # Create a temporary file
    sed "/^import/a\\\\nexport const runtime = '\''nodejs'\''" "$1" > "$1.tmp"
    # Move the temporary file to replace the original
    mv "$1.tmp" "$1"
    echo "Added Node.js runtime to $1"
  fi
' sh {} \;
