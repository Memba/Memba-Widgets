REM goto current directory
cd /d %~dp0

XCOPY .\mobile\images\*.* .\web\images /C /E /I /R /Y
