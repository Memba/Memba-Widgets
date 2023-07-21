# SASS

## Sass Compilers
- dart saas: https://www.npmjs.com/package/sass

## Issue
Kendo UI Themes v6+ now reference files paths starting with @progress/ in node_modules.

## Webpack
Dart Sass works well with webpack.

## WebStorm File Watchers
To configure Dart Sass v1.63+ works as a WebStorm file watcher, the `--load-path` cli option needs to be configured:
- https://sass-lang.com/documentation/cli/dart-sass#load-path
- https://intellij-support.jetbrains.com/hc/en-us/community/posts/207040125-Scss-file-watcher-specify-loadPath-somewhere-

Install with `npm i -g sass`

Then configure a file watcher in settings as follows:
- Program:
  - On Windows `C:\Users\<user>\AppData\Roaming\npm\sass`
  - On macOS `/user/local/bin/sass`
- Arguments: `--load-path=$ContentRoot$/node_modules $FileName$:$FileNameWithoutExtension$.css`
- Output paths to refresh: `$FileNameWithoutExtension$.css:$FileNameWithoutExtension$.css.map`
- Working directory: `$FileDir$`
