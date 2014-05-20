REM goto current directory
cd /d %~dp0
REM set node environment
call "%ProgramFiles%\nodejs\nodevars.bat"
REM -------------------------
karma start sauce.conf.js