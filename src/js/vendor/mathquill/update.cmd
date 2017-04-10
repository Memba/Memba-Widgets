REM goto project root
cd /d %~dp0
cd ../../../..

REM update JS
ATTRIB -R .\src\js\vendor\mathquill\mathquill.js
COPY ..\..\Explorations\mathquill\build\mathquill.js .\src\js\vendor\mathquill\mathquill.js /Y
ATTRIB +R .\src\js\vendor\mathquill\mathquill.js

REM update styles
ATTRIB -R .\src\styles\vendor\mathquill\mathquill.css
COPY ..\..\Explorations\mathquill\build\mathquill.css .\src\styles\vendor\mathquill\mathquill.css /Y
ATTRIB +R .\src\styles\vendor\mathquill\mathquill.css

REM update fonts
XCOPY ..\..\Explorations\mathquill\build\fonts .\src\styles\vendor\mathquill\fonts /C /E /I /R /Y
ATTRIB +R .\src\styles\vendor\mathquill\fonts\*.* /S
