In markdown-it.js. modify to include data:// scheme to GOOD_DATA_RE

```js
// BEGIN Commented by JLC
// var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
// END Commented by JLC

// BEGIN Added by JLC for data:// scheme
var GOOD_DATA_RE = /^data:(\/\/|image\/(gif|png|jpeg|webp);)/;
// END Added by JLC for data:// scheme
```
