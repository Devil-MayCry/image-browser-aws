#!/bin/sh

BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$BIN_DIR")"

node "${ROOT_DIR}/node_modules/aglio/bin/aglio" -i ""${ROOT_DIR}"/docs/blueprint/api.apib" -o ""${ROOT_DIR}"/public/docs/index.html"