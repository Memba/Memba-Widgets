REM Copy Kidoju webfonts
XCOPY ..\Kidoju.WebFonts\dist\fonts\*.* .\src\styles\fonts\ /C /E /I /R /Y
ATTRIB +R .\src\styles\fonts\*

REM update Mathquill
ATTRIB -R .\src\js\vendor\mathquill\mathquill.js
COPY ..\..\Explorations\mathquill\build\mathquill.js .\src\js\vendor\mathquill\mathquill.js /Y
ATTRIB +R .\src\js\vendor\mathquill\mathquill.js

ATTRIB -R .\src\styles\vendor\mathquill\mathquill.css
COPY ..\..\Explorations\mathquill\build\mathquill.css .\src\styles\vendor\mathquill\mathquill.css /Y
ATTRIB +R .\src\styles\vendor\mathquill\mathquill.css

XCOPY ..\..\Explorations\mathquill\build\fonts .\src\styles\vendor\mathquill\fonts /C /E /I /R /Y
ATTRIB +R .\src\styles\vendor\mathquill\fonts\*.* /S
