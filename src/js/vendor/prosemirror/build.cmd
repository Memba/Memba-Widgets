REM goto current directory
cd /d %~dp0

REM build using rollup.config.js
rollup -c
