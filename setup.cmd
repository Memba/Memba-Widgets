cd /d %~dp0
call "%ProgramFiles%\nodejs\nodevars.bat"
REM update npm, which is a requirement for some modules
call npm install -g npm

REM appium
call npm install -g appium-doctor
call npm install -g appium

REM aws
call npm install -g aws-cdk

REM cordova
call npm install -g cordova-simulate
call npm install -g cordova

REM expo cli
REM call npm install -g expo-cli

REM forever -> pm2
call npm install -g forever

REM grunt cli
call npm install -g grunt-cli

REM karma cli
call npm install -g karma-cli

REM ncu
call npm install -g npm-check-updates

REM sass
call npm install -g sass

REM selenium
call npm install -g selenium-standalone
call selenium-standalone install

REM sloc
call npm install -g sloc

REM Typescript
call npm install -g typescript

REM weinre
REM call npm install -g weinre

REM install all local modules in package.json
set NODE_ENV=development
call npm install
