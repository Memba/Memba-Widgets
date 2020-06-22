REM goto current directory
cd /d %~dp0

REM set directory where CodeMirror is built from sources
set DIR="%USERPROFILE%\Desktop\CodeMirror-5.55.0"

REM \addon\lint\
COPY "%DIR%\addon\lint\javascript-lint.js" ".\addon\lint\javascript-lint.js"
REM COPY "%DIR%\addon\lint\jshint.js" ".\addon\lint\jshint.js"
COPY "%DIR%\addon\lint\lint.js" ".\addon\lint\lint.js"
COPY "%DIR%\addon\lint\lint.css" "..\..\..\styles\vendor\codemirror\addon\lint\lint.css"

REM \addon\mode\
COPY "%DIR%\addon\mode\overlay.js" ".\addon\mode\overlay.js"

REM \lib\
COPY "%DIR%\lib\codemirror.js" ".\lib\codemirror.js"
COPY "%DIR%\lib\codemirror.css" "..\..\..\styles\vendor\codemirror\lib\codemirror.css"

REM \mode\
COPY "%DIR%\mode\meta.js" ".\mode\meta.js"
COPY "%DIR%\mode\gfm\gfm.js" ".\mode\gfm\gfm.js"
COPY "%DIR%\mode\javascript\javascript.js" ".\mode\javascript\javascript.js"
COPY "%DIR%\mode\markdown\markdown.js" ".\mode\markdown\markdown.js"
COPY "%DIR%\mode\xml\xml.js" ".\mode\xml\xml.js"

REM \theme\
DEL "..\..\..\styles\vendor\codemirror\theme\*.*" /Q
COPY "%DIR%\theme\*.*" "..\..\..\styles\vendor\codemirror\theme\"
