REM goto current directory
cd /d %~dp0

REM Copy babel-polyfill
XCOPY .\node_modules\@babel\polyfill\dist .\test\vendor /C /E /I /R /Y

REM Copy common files from Kidoju-Server
ATTRIB -R .\src\js\common\pongodb.*.es6
COPY ..\Kidoju.Server\src\js\common\pongodb.*.es6 .\src\js\common\pongodb.*.es6 /Y
ATTRIB +R .\src\js\common\pongodb.*.es6

REM Copy Kidoju-WebFonts
XCOPY ..\Kidoju.WebFonts\dist\fonts\*.* .\src\styles\fonts\ /C /E /I /R /Y
ATTRIB +R .\src\styles\fonts\*

REM Copy Mathquill
ATTRIB -R .\src\js\vendor\mathquill\mathquill.js
COPY ..\..\Explorations\mathquill\build\mathquill.js .\src\js\vendor\mathquill\mathquill.js /Y
ATTRIB +R .\src\js\vendor\mathquill\mathquill.js

ATTRIB -R .\src\styles\vendor\mathquill\mathquill.css
COPY ..\..\Explorations\mathquill\build\mathquill.css .\src\styles\vendor\mathquill\mathquill.css /Y
ATTRIB +R .\src\styles\vendor\mathquill\mathquill.css

XCOPY ..\..\Explorations\mathquill\build\fonts .\src\styles\vendor\mathquill\fonts /C /E /I /R /Y
ATTRIB +R .\src\styles\vendor\mathquill\fonts\*.* /S
