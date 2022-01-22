# SASS

## Sass Compilers
- dart saas: https://www.npmjs.com/package/sass (preferred)
- node-sass: https://www.npmjs.com/package/node-sass (deprecated)

## Issue
Kendo UI Themes v5+ now reference files paths with ~, which is an alias for node_modules

## Webpack
Dart Sass works well with webpack, especially to resolve ~ to node_modules

## WebStorm File Watchers
Unfortunately, Dart Sass v1.49- does not work as a WebStorm file watcher: cannot resolve ~
--load-path cli option, does not seem to help: https://sass-lang.com/documentation/cli/dart-sass#load-path

node-sass v7.0.1 works with node-sass-package-importer v5.3.2 to solve this problem
see https://www.npmjs.com/package/node-sass-package-importer

install with `npm i -g node-sass node-sass-package-importer`

Then configure a file watcher in settings as follows:
- Program: `C:\Users\<user>>\AppData\Roaming\npm\node-sass`
- Arguments: `--source-map true --importer C:\Users\jlche\AppData\Roaming\npm\node_modules\node-sass-package-importer\dist\cli.js $FileName$ $FileNameWithoutExtension$.css`
- Output paths to refresh: `$FileNameWithoutExtension$.css:$FileNameWithoutExtension$.css.map`
- Working directory: `$FileDir$`
