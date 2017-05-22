#!/usr/bin/env bash

echo "start building..."

# use production as env
export NODE_ENV=production

# test with gulp server
cd /usr/local/image-browser-aws/
pm2-docker start "dist/app.js" -i 0

echo "end building"