REM Install Git
REM http://git-scm.com/downloads
REM ----------------------------
REM Install node.js
REM http://nodejs.org/
REM ----------------------------
REM Install Grunt globally
REM open a node.js command prompt and run
REM npm install -g grunt-cli
REM ----------------------------

call "%ProgramFiles%\nodejs\nodevars.bat"
cd %~dp0
call npm install