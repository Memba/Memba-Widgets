REM goto current directory
cd /d %~dp0

REM Copy babel-polyfill
XCOPY .\node_modules\@babel\polyfill\dist .\test\vendor /C /E /I /R /Y

REM Copy common files from Kidoju-Server
XCOPY ..\Kidoju.Server\src\js\common .\src\js\common /C /E /I /R /Y
ATTRIB +R .\src\js\common\pongodb.*.es6
ATTRIB +R .\src\js\common\window.assert.es6
ATTRIB +R .\src\js\common\window.cache.es6
ATTRIB +R .\src\js\common\window.constants.es6
ATTRIB +R .\src\js\common\window.logger.es6
ATTRIB +R .\src\js\common\window.util.es6

REM Copy data files from Kidoju-Server
ATTRIB -R .\src\js\data\*.*
COPY ..\Kidoju.Server\src\js\data\datasources.base.es6 .\src\js\data /Y
COPY ..\Kidoju.Server\src\js\data\datasources.page.es6 .\src\js\data /Y
COPY ..\Kidoju.Server\src\js\data\datasources.pagecomponent.es6 .\src\js\data /Y
COPY ..\Kidoju.Server\src\js\data\models.base.es6 .\src\js\data /Y
COPY ..\Kidoju.Server\src\js\data\models.page.es6 .\src\js\data /Y
COPY ..\Kidoju.Server\src\js\data\models.pagecomponent.es6 .\src\js\data /Y
COPY ..\Kidoju.Server\src\js\data\models.stream.es6 .\src\js\data /Y
ATTRIB +R .\src\js\data\*.*

REM Copy test files from Kidoju-Server
ATTRIB -R .\test\browser\data\*.*
REM COPY ..\Kidoju.Server\test\browser\data\datasources.base.test.* .\test\browser\data /Y
REM COPY ..\Kidoju.Server\test\browser\data\datasources.page.test.* .\test\browser\data /Y
REM COPY ..\Kidoju.Server\test\browser\data\datasources.pagecomponent.test.* .\test\browser\data /Y
COPY ..\Kidoju.Server\test\browser\data\models.base.test.* .\test\browser\data /Y
COPY ..\Kidoju.Server\test\browser\data\models.page.test.* .\test\browser\data /Y
COPY ..\Kidoju.Server\test\browser\data\models.pagecomponent.test.* .\test\browser\data /Y
COPY ..\Kidoju.Server\test\browser\data\models.stream.test.* .\test\browser\data /Y
ATTRIB +R .\test\browser\data\*.*

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
