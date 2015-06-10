cd /d %~dp0

del /S /Q dataviz\*.css
del /S /Q mobile\*.css
del /S /Q web\*.css

REM use -i.bak if you need a backup file before changes
sed -i s/fonts\/DejaVu\/Deja/Deja/g web/fonts/DejaVu/dejavu.less
sed -i s/textures/..\/textures/g web/common/inputs.less
