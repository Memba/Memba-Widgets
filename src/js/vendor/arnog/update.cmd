REM goto current directory
cd /d %~dp0

REM set directory where mathlive is built from sources
set DIR="%USERPROFILE%\Desktop\mathlive-0.69.3"

REM src\
RD ".\addons" /Q /S
RD ".\common" /Q /S
RD ".\core" /Q /S
RD ".\core-atoms" /Q /S
RD ".\core-definitions" /Q /S
RD ".\editor" /Q /S
RD ".\editor-mathfield" /Q /S
RD ".\editor-model" /Q /S
RD ".\public" /Q /S
DEL .\mathlive.ts
DEL .\README.md
DEL .\vue-mathlive.js
XCOPY "%DIR%\src\" ".\"  /C /E /I /R /Y

REM dist\
COPY "%DIR%\dist\mathlive.js" ".\mathlive.js"
COPY "%DIR%\dist\mathlive.min.js" ".\mathlive.min.js"
COPY "%DIR%\dist\mathlive.min.mjs" ".\mathlive.min.mjs"
COPY "%DIR%\dist\mathlive.mjs" ".\mathlive.mjs"
COPY "%DIR%\dist\vue-mathlive.mjs" ".\vue-mathlive.mjs"
XCOPY "%DIR%\dist\public" ".\public"  /C /E /I /R /Y

REM css\
DEL "..\..\..\styles\vendor\arnog\*.*" /F /Q /S
XCOPY "%DIR%\css\" "..\..\..\styles\vendor\arnog\"  /C /E /I /R /Y

REM dist\
COPY "%DIR%\dist\mathlive-fonts.css" "..\..\..\styles\vendor\arnog\mathlive-fonts.css"
COPY "%DIR%\dist\mathlive-static.css" "..\..\..\styles\vendor\arnog\mathlive-static.css"
COPY "%DIR%\dist\sounds\*.*" "..\..\..\styles\vendor\arnog\sounds"
