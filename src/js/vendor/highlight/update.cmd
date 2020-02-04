REM goto current directory
cd /d %~dp0

REM set directory where HighlightJS is built from sources
set DIR="%USERPROFILE%\Desktop\highlight.js-9.18.1"

REM highlight.pack.js
COPY "%DIR%\build\highlight.pack.js" ".\highlight.pack.js"

REM styles
DEL "..\..\..\styles\vendor\highlight\*.*" /Q
COPY "%DIR%\src\styles\*.*" "..\..\..\styles\vendor\highlight\"
