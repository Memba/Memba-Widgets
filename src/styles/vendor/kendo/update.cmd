cd /d %~dp0

del /S /Q dataviz\*.css
del /S /Q mobile\*.css
del /S /Q web\*.css

REM use -i.bak if you need a backup file before changes
REM sed -i 's/fonts\/DejaVu\/Deja/Deja/g' web/fonts/DejaVu/dejavu.less
REM sed -i 's/\'fonts/\'..\/fonts/g' web/common/font-icons.less
REM sed -i 's/"textures/"..\/textures/g' web/common/ie7.less
REM sed -i 's/"textures/"..\/textures/g' web/common/inputs.less
REM sed -i 's/"images/"..\/images/g' mobile/common/icons.less
