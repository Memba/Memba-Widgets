#!/bin/sh

# change directory to script location
cd $(dirname $0)

# set directory where CodeMirror is built from sources
ME=$(whoami)
DIR=/Users/$ME/Desktop/codemirror5-5.65.9

# /addon/lint/
cp -f -f $DIR/addon/lint/javascript-lint.js ./addon/lint/
# cp -f -f $DIR/addon/lint/jshint.js ./addon/lint/jshint.js
cp -f $DIR/addon/lint/lint.js ./addon/lint/
cp -f $DIR/addon/lint/lint.css ../../../styles/vendor/codemirror/addon/lint/

# /addon/mode/
cp -f $DIR/addon/mode/overlay.js ./addon/mode/

# /lib/
cp -f $DIR/lib/codemirror.js ./lib/
cp -f $DIR/lib/codemirror.css ../../../styles/vendor/codemirror/lib/

# /mode/
cp -f $DIR/mode/meta.js ./mode/
cp -f $DIR/mode/gfm/gfm.js ./mode/gfm/
cp -f $DIR/mode/javascript/javascript.js ./mode/javascript/
cp -f $DIR/mode/markdown/markdown.js ./mode/markdown/
cp -f $DIR/mode/xml/xml.js ./mode/xml/

# /theme/
rm ../../../styles/vendor/codemirror/theme/*.*
cp -f $DIR/theme/*.* ../../../styles/vendor/codemirror/theme/
