#!/bin/bash

npm install || exit 1
./node_modules/.bin/jspm install || exit 1

echo "Open your browser at http://localhost:8989"

python -m SimpleHTTPServer 8989
