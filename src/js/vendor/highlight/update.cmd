REM goto current directory
cd /d %~dp0

REM set directory where HighlightJS is built from sources
set DIR="%USERPROFILE%\Desktop\highlight.js-10.0.0"

REM highlight.js
REM build -> node tools/build.js :common
REM see https://highlightjs.readthedocs.io/en/latest/building-testing.htmlgit ini
REM COPY "%DIR%\build\highlight.pack.js" ".\highlight.pack.js" (before v10.0.0)
COPY "%DIR%\build\highlight.js" ".\highlight.js"
COPY "%DIR%\build\highlight.min.js" ".\highlight.min.js"

REM styles
DEL "..\..\..\styles\vendor\highlight\*.*" /Q
COPY "%DIR%\src\styles\*.*" "..\..\..\styles\vendor\highlight\"
