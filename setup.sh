#!/bin/sh

# change directory to script location
cd "$(dirname "$0")"
# call "%ProgramFiles%\nodejs\nodevars.bat"

# update sudo npm, which is a requirement for some modules
sudo npm install -g npm

# appium
sudo npm install -g appium-doctor
sudo npm install -g appium

# aws
sudo npm install -g aws-cdk

# cordova
sudo npm install -g cordova-simulate
sudo npm install -g cordova

# expo cli
# sudo npm install -g expo-cli

# forever -> pm2
sudo npm install -g forever

# grunt cli
sudo npm install -g grunt-cli

# karma cli
sudo npm install -g karma-cli

# ncu
sudo npm install -g npm-check-updates

# sass
sudo npm install -g sass

# selenium
sudo npm install -g selenium-standalone
sudo selenium-standalone install --version 4.8.0

# sloc
sudo npm install -g sloc

# Typescript
sudo npm install -g typescript

# weinre
# sudo npm install -g weinre

# install all local modules in package.json
NODE_ENV=development
npm install
