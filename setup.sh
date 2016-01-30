#!/bin/sh

# change directory to script location
cd "$(dirname "$0")"

# update npm, which is a requirement for some modules
npm install -g npm
# grunt command in terminal mode
npm install -g grunt-cli
# code coverage with istanbul
npm install -g istanbul
# karma command in terminal mode
npm install -g karma-cli
# mocha command in terminal mode
# npm install -g mocha
# nodemon to run webapp while debugging browser code
npm install -g nodemon
# webpack for builds
npm install -g webpack
npm install -g webpack-dev-server
# install dependencies listed in package.json
npm install
