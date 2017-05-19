#!/usr/bin/env bash

BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$BIN_DIR")"

# clean ./dist
rm -rf ""${ROOT_DIR}"/dist"

# make sure using the latest dependencies
npm install --registry http://npmjs.gagogroup.cn

# Transpile TypeScript into JavaScript
gulp ts

# scripts depends on NODE_ENV (can be production, development_server and development)
if [ "$NODE_ENV" == "production" ]
then

  # use pm2 to start app.js
  pm2 stop all
  pm2 start ""${ROOT_DIR}"/dist/app.js"

  # send change log
  node ./dist/tools/sendchangelog.js

elif [ "$NODE_ENV" == "development_server" ]
then

  # hint if TypeScript Code Style is followed
  sh tslint.sh

  # start redis in background and show on console
  redis-server --daemonize yes
  ps aux | grep redis-server

  # use pm2 to start app.js
  pm2 stop all
  pm2 start ""${ROOT_DIR}"/dist/app.js"

  # send change log
  # node ./dist/tools/sendchangelog.js

else

  # hint if TypeScript Code Style is followed
  sh ./bin/tslint.sh

  # start redis in background
  redis-server --daemonize yes

  # start server
  gulp server

fi