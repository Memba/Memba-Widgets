/* globals SystemJS */

const count = window.location.pathname.match(/\//g).length;
const baseURL = new Array(count - 2).fill('../').join('');

// eslint-disable-next-line no-undef
SystemJS.config({
    baseURL,
    map: {
        jquery: 'src/js/vendor/jquery/jquery-3.6.4.js',
        // http://docs.telerik.com/kendo-ui/third-party/systemjs
        'kendo.culture.en-GB':
            'src/js/vendor/kendo/cultures/kendo.culture.en-GB.js',
        'kendo.messages.en-GB':
            'src/js/vendor/kendo/messages/kendo.messages.en-GB.js',
        'kendo.actionsheet': 'src/js/vendor/kendo/kendo.actionsheet.js',
        'kendo.appbar': 'src/js/vendor/kendo/kendo.appbar.js',
        'kendo.autocomplete': 'src/js/vendor/kendo/kendo.autocomplete.js',
        'kendo.avatar': 'src/js/vendor/kendo/kendo.avatar.js',
        'kendo.badge': 'src/js/vendor/kendo/kendo.badge.js',
        'kendo.binder': 'src/js/vendor/kendo/kendo.binder.js',
        'kendo.bottomnavigation':
            'src/js/vendor/kendo/kendo.bottomnavigation.js',
        'kendo.breadcrumb': 'src/js/vendor/kendo/kendo.breadcrumb.js',
        'kendo.button': 'src/js/vendor/kendo/kendo.button.js',
        'kendo.button.menu': 'src/js/vendor/kendo/kendo.button.menu.js',
        'kendo.buttongroup': 'src/js/vendor/kendo/kendo.buttongroup.js',
        'kendo.calendar': 'src/js/vendor/kendo/kendo.calendar.js',
        'kendo.captcha': 'src/js/vendor/kendo/kendo.captcha.js',
        'kendo.chat': 'src/js/vendor/kendo/kendo.chat.js',
        'kendo.checkbox': 'src/js/vendor/kendo/kendo.checkbox.js',
        'kendo.checkboxgroup': 'src/js/vendor/kendo/kendo.checkboxgroup.js',
        'kendo.chip': 'src/js/vendor/kendo/kendo.chip.js',
        'kendo.chiplist': 'src/js/vendor/kendo/kendo.chiplist.js',
        'kendo.circularprogressbar':
            'src/js/vendor/kendo/kendo.circularprogressbar.js',
        'kendo.color': 'src/js/vendor/kendo/kendo.color.js',
        'kendo.colorpicker': 'src/js/vendor/kendo/kendo.colorpicker.js',
        'kendo.columnmenu': 'src/js/vendor/kendo/kendo.columnmenu.js',
        'kendo.columnsorter': 'src/js/vendor/kendo/kendo.columnsorter.js',
        'kendo.combobox': 'src/js/vendor/kendo/kendo.combobox.js',
        'kendo.core': 'src/js/vendor/kendo/kendo.core.js',
        'kendo.data': 'src/js/vendor/kendo/kendo.data.js',
        'kendo.data.odata': 'src/js/vendor/kendo/kendo.data.odata.js',
        'kendo.data.signalr': 'src/js/vendor/kendo/kendo.data.signalr.js',
        'kendo.data.xml': 'src/js/vendor/kendo/kendo.data.xml.js',
        'kendo.dataviz.barcode': 'src/js/vendor/kendo/kendo.dataviz.barcode.js',
        'kendo.dataviz.chart': 'src/js/vendor/kendo/kendo.dataviz.chart.js',
        'kendo.dataviz.core': 'src/js/vendor/kendo/kendo.dataviz.core.js',
        'kendo.dataviz.diagram': 'src/js/vendor/kendo/kendo.dataviz.diagram.js',
        'kendo.dataviz.gauge': 'src/js/vendor/kendo/kendo.dataviz.gauge.js',
        'kendo.dataviz': 'src/js/vendor/kendo/kendo.dataviz.js',
        'kendo.dataviz.map': 'src/js/vendor/kendo/kendo.dataviz.map.js',
        'kendo.dataviz.mobile': 'src/js/vendor/kendo/kendo.dataviz.mobile.js',
        'kendo.dataviz.qrcode': 'src/js/vendor/kendo/kendo.dataviz.qrcode.js',
        'kendo.dataviz.sparkline':
            'src/js/vendor/kendo/kendo.dataviz.sparkline.js',
        'kendo.dataviz.stock': 'src/js/vendor/kendo/kendo.dataviz.stock.js',
        'kendo.dataviz.themes': 'src/js/vendor/kendo/kendo.dataviz.themes.js',
        'kendo.dataviz.treemap': 'src/js/vendor/kendo/kendo.dataviz.treemap.js',
        'kendo.dateinput': 'src/js/vendor/kendo/kendo.dateinput.js',
        'kendo.datepicker': 'src/js/vendor/kendo/kendo.datepicker.js',
        'kendo.daterangepicker': 'src/js/vendor/kendo/kendo.daterangepicker.js',
        'kendo.datetimepicker': 'src/js/vendor/kendo/kendo.datetimepicker.js',
        'kendo.dialog': 'src/js/vendor/kendo/kendo.dialog.js',
        'kendo.dom': 'src/js/vendor/kendo/kendo.dom.js',
        'kendo.draganddrop': 'src/js/vendor/kendo/kendo.draganddrop.js',
        'kendo.drawer': 'src/js/vendor/kendo/kendo.drawer.js',
        'kendo.drawing': 'src/js/vendor/kendo/kendo.drawing.js',
        'kendo.dropdownbutton': 'src/js/vendor/kendo/kendo.dropdownbutton.js',
        'kendo.dropdownlist': 'src/js/vendor/kendo/kendo.dropdownlist.js',
        'kendo.dropdowntree': 'src/js/vendor/kendo/kendo.dropdowntree.js',
        'kendo.editable': 'src/js/vendor/kendo/kendo.editable.js',
        'kendo.editor': 'src/js/vendor/kendo/kendo.editor.js',
        'kendo.excel': 'src/js/vendor/kendo/kendo.excel.js',
        'kendo.expansionpanel': 'src/js/vendor/kendo/kendo.expansionpanel.js',
        'kendo.filebrowser': 'src/js/vendor/kendo/kendo.filebrowser.js',
        'kendo.filemanager': 'src/js/vendor/kendo/kendo.filemanager.js',
        'kendo.filter': 'src/js/vendor/kendo/kendo.filter.js',
        'kendo.filtercell': 'src/js/vendor/kendo/kendo.filtercell.js',
        'kendo.filtermenu': 'src/js/vendor/kendo/kendo.filtermenu.js',
        'kendo.floatingactionbutton':
            'src/js/vendor/kendo/kendo.floatingactionbutton.js',
        'kendo.floatinglabel': 'src/js/vendor/kendo/kendo.floatinglabel.js',
        'kendo.form': 'src/js/vendor/kendo/kendo.form.js',
        'kendo.fx': 'src/js/vendor/kendo/kendo.fx.js',
        'kendo.gantt': 'src/js/vendor/kendo/kendo.gantt.js',
        'kendo.gantt.list': 'src/js/vendor/kendo/kendo.gantt.list.js',
        'kendo.gantt.timeline': 'src/js/vendor/kendo/kendo.gantt.timeline.js',
        'kendo.grid': 'src/js/vendor/kendo/kendo.grid.js',
        'kendo.groupable': 'src/js/vendor/kendo/kendo.groupable.js',
        'kendo.html.base': 'src/js/vendor/kendo/kendo.html.base.js',
        'kendo.html.button': 'src/js/vendor/kendo/kendo.html.button.js',
        'kendo.html.chip': 'src/js/vendor/kendo/kendo.html.chip.js',
        'kendo.html.chiplist': 'src/js/vendor/kendo/kendo.html.chiplist.js',
        'kendo.html.icon': 'src/js/vendor/kendo/kendo.html.icon.js',
        'kendo.html.input': 'src/js/vendor/kendo/kendo.html.input.js',
        'kendo.icons': 'src/js/vendor/kendo/kendo.icons.js',
        'kendo.imagebrowser': 'src/js/vendor/kendo/kendo.imagebrowser.js',
        'kendo.imageeditor': 'src/js/vendor/kendo/kendo.imageeditor.js',
        'kendo.inputgroupbase': 'src/js/vendor/kendo/kendo.inputgroupbase.js',
        'kendo.label': 'src/js/vendor/kendo/kendo.label.js',
        'kendo.list': 'src/js/vendor/kendo/kendo.list.js',
        'kendo.listbox': 'src/js/vendor/kendo/kendo.listbox.js',
        'kendo.listview': 'src/js/vendor/kendo/kendo.listview.js',
        'kendo.loader': 'src/js/vendor/kendo/kendo.loader.js',
        'kendo.maskedtextbox': 'src/js/vendor/kendo/kendo.maskedtextbox.js',
        'kendo.mediaplayer': 'src/js/vendor/kendo/kendo.mediaplayer.js',
        'kendo.menu': 'src/js/vendor/kendo/kendo.menu.js',
        'kendo.mobile.actionsheet':
            'src/js/vendor/kendo/kendo.mobile.actionsheet.js',
        'kendo.mobile.application':
            'src/js/vendor/kendo/kendo.mobile.application.js',
        'kendo.mobile.button': 'src/js/vendor/kendo/kendo.mobile.button.js',
        'kendo.mobile.buttongroup':
            'src/js/vendor/kendo/kendo.mobile.buttongroup.js',
        'kendo.mobile.collapsible':
            'src/js/vendor/kendo/kendo.mobile.collapsible.js',
        'kendo.mobile.drawer': 'src/js/vendor/kendo/kendo.mobile.drawer.js',
        'kendo.mobile.listview': 'src/js/vendor/kendo/kendo.mobile.listview.js',
        'kendo.mobile.loader': 'src/js/vendor/kendo/kendo.mobile.loader.js',
        'kendo.mobile.modalview':
            'src/js/vendor/kendo/kendo.mobile.modalview.js',
        'kendo.mobile.navbar': 'src/js/vendor/kendo/kendo.mobile.navbar.js',
        'kendo.mobile.pane': 'src/js/vendor/kendo/kendo.mobile.pane.js',
        'kendo.mobile.popover': 'src/js/vendor/kendo/kendo.mobile.popover.js',
        'kendo.mobile.scroller': 'src/js/vendor/kendo/kendo.mobile.scroller.js',
        'kendo.mobile.scrollview':
            'src/js/vendor/kendo/kendo.mobile.scrollview.js',
        'kendo.mobile.shim': 'src/js/vendor/kendo/kendo.mobile.shim.js',
        'kendo.mobile.splitview':
            'src/js/vendor/kendo/kendo.mobile.splitview.js',
        'kendo.mobile.switch': 'src/js/vendor/kendo/kendo.mobile.switch.js',
        'kendo.mobile.tabstrip': 'src/js/vendor/kendo/kendo.mobile.tabstrip.js',
        'kendo.mobile.view': 'src/js/vendor/kendo/kendo.mobile.view.js',
        'kendo.multicolumncombobox':
            'src/js/vendor/kendo/kendo.multicolumncombobox.js',
        'kendo.multiselect': 'src/js/vendor/kendo/kendo.multiselect.js',
        'kendo.multiviewcalendar':
            'src/js/vendor/kendo/kendo.multiviewcalendar.js',
        'kendo.notification': 'src/js/vendor/kendo/kendo.notification.js',
        'kendo.numerictextbox': 'src/js/vendor/kendo/kendo.numerictextbox.js',
        'kendo.ooxml': 'src/js/vendor/kendo/kendo.ooxml.js',
        'kendo.orgchart': 'src/js/vendor/kendo/kendo.orgchart.js',
        'kendo.pager': 'src/js/vendor/kendo/kendo.pager.js',
        'kendo.pane': 'src/js/vendor/kendo/kendo.pane.js',
        'kendo.panelbar': 'src/js/vendor/kendo/kendo.panelbar.js',
        'kendo.pdf': 'src/js/vendor/kendo/kendo.pdf.js',
        'kendo.pdfviewer': 'src/js/vendor/kendo/kendo.pdfviewer.js',
        'kendo.pivot.common': 'src/js/vendor/kendo/kendo.pivot.common.js',
        'kendo.pivot.configurator':
            'src/js/vendor/kendo/kendo.pivot.configurator.js',
        'kendo.pivot.fieldmenu': 'src/js/vendor/kendo/kendo.pivot.fieldmenu.js',
        'kendo.pivotgrid': 'src/js/vendor/kendo/kendo.pivotgrid.js',
        'kendo.popover': 'src/js/vendor/kendo/kendo.popover.js',
        'kendo.popup': 'src/js/vendor/kendo/kendo.popup.js',
        'kendo.progressbar': 'src/js/vendor/kendo/kendo.progressbar.js',
        'kendo.radiobutton': 'src/js/vendor/kendo/kendo.radiobuttonn.js',
        'kendo.radiogroup': 'src/js/vendor/kendo/kendo.radiogroup.js',
        'kendo.rating': 'src/js/vendor/kendo/kendo.rating.js',
        'kendo.reorderable': 'src/js/vendor/kendo/kendo.reorderable.js',
        'kendo.resizable': 'src/js/vendor/kendo/kendo.resizable.js',
        'kendo.responsivepanel': 'src/js/vendor/kendo/kendo.responsivepanel.js',
        'kendo.ripple': 'src/js/vendor/kendo/kendo.ripple.js',
        'kendo.router': 'src/js/vendor/kendo/kendo.router.js',
        'kendo.scheduler.agendaview':
            'src/js/vendor/kendo/kendo.scheduler.agendaview.js',
        'kendo.scheduler.dayview':
            'src/js/vendor/kendo/kendo.scheduler.dayview.js',
        'kendo.scheduler': 'src/js/vendor/kendo/kendo.scheduler.js',
        'kendo.scheduler.monthview':
            'src/js/vendor/kendo/kendo.scheduler.monthview.js',
        'kendo.scheduler.recurrence':
            'src/js/vendor/kendo/kendo.scheduler.recurrence.js',
        'kendo.scheduler.timelineview':
            'src/js/vendor/kendo/kendo.scheduler.timelineview.js',
        'kendo.scheduler.view': 'src/js/vendor/kendo/kendo.scheduler.view.js',
        'kendo.scheduler.yearview':
            'src/js/vendor/kendo/kendo.scheduler.yearview.js',
        'kendo.scrollview': 'src/js/vendor/kendo/kendo.scrollview.js',
        'kendo.selectable': 'src/js/vendor/kendo/kendo.selectable.js',
        'kendo.signature': 'src/js/vendor/kendo/kendo.signature.js',
        'kendo.skeletoncontainer':
            'src/js/vendor/kendo/kendo.skeletoncontainer.js',
        'kendo.slider': 'src/js/vendor/kendo/kendo.slider.js',
        'kendo.sortable': 'src/js/vendor/kendo/kendo.sortable.js',
        'kendo.splitbutton': 'src/js/vendor/kendo/kendo.splitbutton.js',
        'kendo.splitter': 'src/js/vendor/kendo/kendo.splitter.js',
        'kendo.spreadsheet': 'src/js/vendor/kendo/kendo.spreadsheet.js',
        'kendo.stepper': 'src/js/vendor/kendo/kendo.stepper.js',
        'kendo.switch': 'src/js/vendor/kendo/kendo.switch.js',
        'kendo.tabstrip': 'src/js/vendor/kendo/kendo.tabstrip.js',
        'kendo.taskboard': 'src/js/vendor/kendo/kendo.taskboard.js',
        'kendo.textarea': 'src/js/vendor/kendo/kendo.textarea.js',
        'kendo.textbox': 'src/js/vendor/kendo/kendo.textbox.js',
        'kendo.tilelayout': 'src/js/vendor/kendo/kendo.tilelayout.js',
        'kendo.timedurationpicker':
            'src/js/vendor/kendo/kendo.timedurationpicker.js',
        'kendo.timeline': 'src/js/vendor/kendo/kendo.timeline.js',
        'kendo.timepicker': 'src/js/vendor/kendo/kendo.timepicker.js',
        'kendo.timeselector': 'src/js/vendor/kendo/kendo.timeselector.js',
        'kendo.timezones': 'src/js/vendor/kendo/kendo.timezones.js',
        'kendo.togglebutton': 'src/js/vendor/kendo/kendo.togglebutton.js',
        'kendo.toggleinputbase': 'src/js/vendor/kendo/kendo.toggleinputbase.js',
        'kendo.toolbar': 'src/js/vendor/kendo/kendo.toolbar.js',
        'kendo.tooltip': 'src/js/vendor/kendo/kendo.tooltip.js',
        'kendo.touch': 'src/js/vendor/kendo/kendo.touch.js',
        'kendo.treelist': 'src/js/vendor/kendo/kendo.treelist.js',
        'kendo.treeview.draganddrop':
            'src/js/vendor/kendo/kendo.treeview.draganddrop.js',
        'kendo.treeview': 'src/js/vendor/kendo/kendo.treeview.js',
        'kendo.upload': 'src/js/vendor/kendo/kendo.upload.js',
        'kendo.userevents': 'src/js/vendor/kendo/kendo.userevents.js',
        'kendo.validator': 'src/js/vendor/kendo/kendo.validator.js',
        'kendo.view': 'src/js/vendor/kendo/kendo.view.js',
        'kendo.virtuallist': 'src/js/vendor/kendo/kendo.virtuallist.js',
        'kendo.window': 'src/js/vendor/kendo/kendo.window.js',
        'kendo.wizard': 'src/js/vendor/kendo/kendo.wizard.js',
        // pako_deflate: 'src/js/vendor/kendo/pako_deflate.js',
        // Test frameworks
        chai: 'test/vendor/chai.js',
        'chai-jquery': 'test/vendor/chai-jquery.js',
        'jquery.mockjax': 'test/vendor/jquery.mockjax.js',
        'jquery.simulate': 'test/vendor/jquery.simulate.js',
        jscheck: 'test/vendor/jscheck.js',
        mocha: 'test/vendor/mocha.js',
        modernizr: 'src/js/vendor/modernizr/modernizr.js',
        sinon: 'test/vendor/sinon.js',
        'sinon-chai': 'test/vendor/sinon-chai.js',
    },
    meta: {
        'test/vendor/chai-jquery.js': { format: 'cjs' },
        'test/vendor/fulfill.js': { format: 'esm' },
        'test/vendor/jquery.mockjax.js': { format: 'global' },
        'test/vendor/jscheck.js': { format: 'esm' },
        'test/vendor/mocha.js': { format: 'global' },
        'test/vendor/sinon-chai.js': { format: 'cjs' },
    },
    packages: {
        'src/js': {
            defaultExtension: 'js',
            meta: {
                // IMPORTANT! See https://github.com/jshint/jshint/issues/2840
                'vendor/codemirror/addon/lint/jshint.js': {
                    format: 'global',
                },
                'vendor/highlight/*': {
                    format: 'esm',
                },
                'vendor/kendo/*': {
                    format: 'esm',
                },
                'vendor/modernizr/modernizr.js': {
                    format: 'global',
                },
                'vendor/mathquill/mathquill.js': {
                    format: 'global',
                },
                '*.js': {
                    babelOptions: {
                        es2015: false,
                        stage2: false,
                        stage3: false,
                    },
                    format: 'amd',
                },
                '*.es6': {
                    format: 'esm',
                },
                '*.jsx': {
                    format: 'esm',
                },
                '*.mjs': {
                    format: 'esm',
                },
            },
        },
    },
    paths: {
        '@progress/kendo-svg-icons':
            'node_modules/@progress/kendo-svg-icons/dist/index.es.js',
        'plugin-babel': 'node_modules/systemjs-plugin-babel/plugin-babel.js',
        'systemjs-babel-build':
            'node_modules/systemjs-plugin-babel/systemjs-babel-browser.js',
    },
    transpiler: 'plugin-babel',
});
