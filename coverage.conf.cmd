REM goto current directory
cd /d %~dp0
REM set node environment
call "%ProgramFiles%\nodejs\nodevars.bat"
set NODE_ENV=test
REM -------------------------
karma start coverage.conf.js
