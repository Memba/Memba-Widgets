REM goto current directory
cd /d %~dp0
REM set node environment
call "%ProgramFiles%\nodejs\nodevars.bat"
REM -------------------------
REM Install global packages
call npm update -g npm
call npm install -g grunt-cli
call npm install -g istanbul
call npm install -g karma-cli
REM call npm install -g mocha
call npm install -g nodemon
call npm install -g webpack
call npm install -g webpack-dev-server
REM -------------------------
REM Install dependencies listed in package.json
call npm install
