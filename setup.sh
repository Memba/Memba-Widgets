#!/bin/sh

# change directory to script location
cd "$(dirname "$0")"
# call "%ProgramFiles%\nodejs\nodevars.bat"

# update npm, which is a requirement for some modules
npm install -g npm

# appium
npm install -g appium-doctor
npm install -g appium

# aws
npm install -g aws-cdk

# cordova
npm install -g cordova-simulate
npm install -g cordova

# expo cli
# npm install -g expo-cli

# forever -> pm2
npm install -g forever

# grunt cli
npm install -g grunt-cli

# karma cli
npm install -g karma-cli

# ncu
npm install -g npm-check-updates

# sass
npm install -g sass

# selenium
npm install -g selenium-standalone
selenium-standalone install

# sloc
npm install -g sloc

# Typescript
npm install -g typescript

# weinre
# npm install -g weinre

# install all local modules in package.json
NODE_ENV=development
npm install
