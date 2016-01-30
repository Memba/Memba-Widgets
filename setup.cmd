cd /d %~dp0
call "%ProgramFiles%\nodejs\nodevars.bat"
REM update npm, which is a requirement for some modules
npm install -g npm
REM grunt command in terminal mode
npm install -g grunt-cli
REM code coverage with istanbul
npm install -g istanbul
REM karma command in terminal mode
npm install -g karma-cli
REM mocha command in terminal mode
REM npm install -g mocha
REM nodemon to run webapp while debugging browser code
npm install -g nodemon
REM webpack for builds
npm install -g webpack
npm install -g webpack-dev-server
REM install dependencies listed in package.json
npm install
