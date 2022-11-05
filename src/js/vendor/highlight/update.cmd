REM ****************************************
REM No need to build, simply import sources
REM   - Beware deep-freeze-es6
REM   - Check http://localhost:63342/Memba-Widgets/src/js/widgets/widgets.markdown.html
REM ****************************************

REM goto current directory
cd /d %~dp0

REM set directory where highlightJS is built from sources
set DIR="%USERPROFILE%\Desktop\highlight.js-11.6.0"

COPY "%DIR%\src\core.d.ts" ".\src\"
COPY "%DIR%\src\highlight.js" ".\src\"
COPY "%DIR%\src\stub.js" ".\src\"

REM \src\languages\
DEL ".\src\languages" /Q /S
XCOPY "%DIR%\src\languages\*.*" ".\src\languages\" /C /E /I /R /Y

REM \src\lib\
DEL ".\src\lib" /Q /S
XCOPY "%DIR%\src\lib\*.*" ".\src\lib\" /C /E /I /R /Y

REM \src\styles\
DEL "..\..\..\styles\vendor\highlight\*.*" /Q /S
XCOPY "%DIR%\src\styles\*.*" "..\..\..\styles\vendor\highlight\" /C /E /I /R /Y
