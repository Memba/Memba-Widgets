After upgrading Kendo UI use update.cmd to 
1) remove all CSS files
2) in kendo/web/fonts/DejaVu/dejavu.less, replace ```src: url("fonts/DejaVu/``` with ```src: url("``` 
3) in kendo/web/common/inputs.less, replace ```url("textures``` with ```url("../textures```

Steps 2) and 3) have now been fixed by Telerik in 2015 Q3 SP1
See: https://github.com/telerik/kendo-ui-core/issues/1112
