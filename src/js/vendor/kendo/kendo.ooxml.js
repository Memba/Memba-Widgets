/** 
 * Kendo UI v2017.1.118 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2017 Telerik AD. All rights reserved.                                                                                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('kendo.ooxml', ['kendo.core'], f);
}(function () {
    var __meta__ = {
        id: 'ooxml',
        name: 'XLSX generation',
        category: 'framework',
        advanced: true,
        depends: ['core']
    };
    (function ($, kendo) {
        var RELS = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' + '</Relationships>';
        var CORE = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" ' + 'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" ' + 'xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' + '<dc:creator>${creator}</dc:creator>' + '<cp:lastModifiedBy>${lastModifiedBy}</cp:lastModifiedBy>' + '<dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created>' + '<dcterms:modified xsi:type="dcterms:W3CDTF">${modified}</dcterms:modified>' + '</cp:coreProperties>');
        var APP = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' + '<Application>Microsoft Excel</Application>' + '<DocSecurity>0</DocSecurity>' + '<ScaleCrop>false</ScaleCrop>' + '<HeadingPairs>' + '<vt:vector size="2" baseType="variant">' + '<vt:variant>' + '<vt:lpstr>Worksheets</vt:lpstr>' + '</vt:variant>' + '<vt:variant>' + '<vt:i4>${sheets.length}</vt:i4>' + '</vt:variant>' + '</vt:vector>' + '</HeadingPairs>' + '<TitlesOfParts>' + '<vt:vector size="${sheets.length}" baseType="lpstr">' + '# for (var idx = 0; idx < sheets.length; idx++) { #' + '# if (sheets[idx].options.title) { #' + '<vt:lpstr>${sheets[idx].options.title}</vt:lpstr>' + '# } else { #' + '<vt:lpstr>Sheet${idx+1}</vt:lpstr>' + '# } #' + '# } #' + '</vt:vector>' + '</TitlesOfParts>' + '<LinksUpToDate>false</LinksUpToDate>' + '<SharedDoc>false</SharedDoc>' + '<HyperlinksChanged>false</HyperlinksChanged>' + '<AppVersion>14.0300</AppVersion>' + '</Properties>');
        var CONTENT_TYPES = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' + '<Default Extension="xml" ContentType="application/xml" />' + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' + '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' + '# for (var idx = 1; idx <= count; idx++) { #' + '<Override PartName="/xl/worksheets/sheet${idx}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' + '# } #' + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml" />' + '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml" />' + '</Types>');
        var WORKBOOK = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' + '<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9303" />' + '<workbookPr defaultThemeVersion="124226" />' + '<bookViews>' + '<workbookView xWindow="240" yWindow="45" windowWidth="18195" windowHeight="7995" />' + '</bookViews>' + '<sheets>' + '# for (var idx = 0; idx < sheets.length; idx++) { #' + '# var options = sheets[idx].options; #' + '# var name = options.name || options.title #' + '# if (name) { #' + '<sheet name="${name}" sheetId="${idx+1}" r:id="rId${idx+1}" />' + '# } else { #' + '<sheet name="Sheet${idx+1}" sheetId="${idx+1}" r:id="rId${idx+1}" />' + '# } #' + '# } #' + '</sheets>' + '# if (filterNames.length || userNames.length) { #' + '<definedNames>' + ' # for (var di = 0; di < filterNames.length; di++) { #' + '<definedName name="_xlnm._FilterDatabase" hidden="1" localSheetId="${filterNames[di].localSheetId}">' + '${filterNames[di].name}!$${filterNames[di].from}:$${filterNames[di].to}' + '</definedName>' + ' # } #' + ' # for (var i = 0; i < userNames.length; ++i) { #' + '<definedName name="${userNames[i].name}" hidden="${userNames[i].hidden ? 1 : 0}"' + ' # if (userNames[i].localSheetId != null) { # localSheetId="${userNames[i].localSheetId}" # } #' + '>${userNames[i].value}</definedName>' + ' # } #' + '</definedNames>' + '# } #' + '<calcPr fullCalcOnLoad="1" calcId="145621" />' + '</workbook>');
        var WORKSHEET = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" mc:Ignorable="x14ac">' + '<dimension ref="A1" />' + '<sheetViews>' + '<sheetView #if(index==0) {# tabSelected="1" #}# workbookViewId="0" #if (showGridLines === false) {# showGridLines="0" #}#>' + '# if (frozenRows || frozenColumns) { #' + '<pane state="frozen"' + '# if (frozenColumns) { #' + ' xSplit="${frozenColumns}"' + '# } #' + '# if (frozenRows) { #' + ' ySplit="${frozenRows}"' + '# } #' + ' topLeftCell="${String.fromCharCode(65 + (frozenColumns || 0))}${(frozenRows || 0)+1}"' + '/>' + '# } #' + '</sheetView>' + '</sheetViews>' + '<sheetFormatPr x14ac:dyDescent="0.25" defaultRowHeight="#= defaults.rowHeight ? defaults.rowHeight * 0.75 : 15 #" ' + '# if (defaults.columnWidth) { # defaultColWidth="#= kendo.ooxml.toWidth(defaults.columnWidth) #" # } #' + ' />' + '# if (defaultCellStyleId != null || (columns && columns.length > 0)) { #' + '<cols>' + '# if (!columns || !columns.length) { #' + '<col min="1" max="16384" style="${defaultCellStyleId}" ' + '# if (defaults.columnWidth) { # width="#= kendo.ooxml.toWidth(defaults.columnWidth) #" # } #' + ' />' + '# } #' + '# for (var ci = 0; ci < columns.length; ci++) { #' + '# var column = columns[ci]; #' + '# var columnIndex = typeof column.index === "number" ? column.index + 1 : (ci + 1); #' + '# if (column.width === 0) { #' + '<col #if(defaultCellStyleId!=null){# style="${defaultCellStyleId}" #}#' + 'min="${columnIndex}" max="${columnIndex}" hidden="1" customWidth="1" />' + '# } else if (column.width) { #' + '<col #if(defaultCellStyleId!=null){# style="${defaultCellStyleId}" #}#' + 'min="${columnIndex}" max="${columnIndex}" customWidth="1"' + '# if (column.autoWidth) { #' + ' width="${((column.width*7+5)/7*256)/256}" bestFit="1"' + '# } else { #' + ' width="#= kendo.ooxml.toWidth(column.width) #" ' + '# } #' + '/>' + '# } #' + '# } #' + '</cols>' + '# } #' + '<sheetData>' + '# for (var ri = 0; ri < data.length; ri++) { #' + '# var row = data[ri]; #' + '# var rowIndex = typeof row.index === "number" ? row.index + 1 : (ri + 1); #' + '<row r="${rowIndex}" x14ac:dyDescent="0.25" ' + '# if (row.height === 0) { # hidden="1" # } ' + '  else if (row.height) { # ht="#= kendo.ooxml.toHeight(row.height) #" customHeight="1" # } #' + ' >' + '# for (var ci = 0; ci < row.data.length; ci++) { #' + '# var cell = row.data[ci];#' + '<c r="#=cell.ref#"# if (cell.style) { # s="#=cell.style#" # } ## if (cell.type) { # t="#=cell.type#"# } #>' + '# if (cell.formula != null) { #' + '<f>${cell.formula}</f>' + '# } #' + '# if (cell.value != null) { #' + '<v>${cell.value}</v>' + '# } #' + '</c>' + '# } #' + '</row>' + '# } #' + '</sheetData>' + '# if (filter) { #' + '<autoFilter ref="${filter.from}:${filter.to}"/>' + '# } #' + '# if (mergeCells.length) { #' + '<mergeCells count="${mergeCells.length}">' + '# for (var ci = 0; ci < mergeCells.length; ci++) { #' + '<mergeCell ref="${mergeCells[ci]}"/>' + '# } #' + '</mergeCells>' + '# } #' + '# if (validations.length) { #' + '<dataValidations>' + '# for (var vi = 0; vi < validations.length; vi++) { #' + '# var val = validations[vi]; #' + '<dataValidation sqref="#= val.sqref.join(" ") #"' + ' showErrorMessage="#= val.showErrorMessage #"' + ' type="#= val.type #"' + '# if (val.type != "list") {# operator="#= val.operator #" # } #' + ' allowBlank="#= val.allowBlank #"' + ' showDropDown="#= val.showDropDown #"' + '# if (val.error) {# error="#= val.error #" # } #' + '# if (val.errorTitle) {# errorTitle="#= val.errorTitle #" # } #' + '>' + '# if (val.formula1) { #' + '<formula1>#= val.formula1 #</formula1>' + '# } #' + '# if (val.formula2) { #' + '<formula2>#= val.formula2 #</formula2>' + '# } #' + '</dataValidation>' + '# } #' + '</dataValidations>' + '# } #' + '# if (hyperlinks.length) { #' + '<hyperlinks>' + '# for (var hi = 0; hi < hyperlinks.length; hi++) { #' + '<hyperlink ref="${hyperlinks[hi].ref}" r:id="rId${hi}"/>' + '# } #' + '</hyperlinks>' + '# } #' + '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3" />' + '</worksheet>');
        var WORKBOOK_RELS = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + '# for (var idx = 1; idx <= count; idx++) { #' + '<Relationship Id="rId${idx}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx}.xml" />' + '# } #' + '<Relationship Id="rId${count+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />' + '<Relationship Id="rId${count+2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml" />' + '</Relationships>');
        var WORKSHEET_RELS = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + '# for (var i = 0; i < hyperlinks.length; i++) { #' + '<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${hyperlinks[i].target}" TargetMode="External" />' + '# } #' + '</Relationships>');
        var SHARED_STRINGS = kendo.template('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${count}" uniqueCount="${uniqueCount}">' + '# for (var index in indexes) { #' + '<si><t>${index.substring(1)}</t></si>' + '# } #' + '</sst>');
        var STYLES = kendo.template('<?xml version="1.0" encoding="UTF-8"?>' + '<styleSheet' + ' xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"' + ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"' + ' mc:Ignorable="x14ac"' + ' xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' + '<numFmts count="${formats.length}">' + '# for (var fi = 0; fi < formats.length; fi++) { #' + '# var format = formats[fi]; #' + '<numFmt formatCode="${format.format}" numFmtId="${165+fi}" />' + '# } #' + '</numFmts>' + '<fonts count="${fonts.length+1}" x14ac:knownFonts="1">' + '<font>' + '<sz val="11" />' + '<color theme="1" />' + '<name val="Calibri" />' + '<family val="2" />' + '<scheme val="minor" />' + '</font>' + '# for (var fi = 0; fi < fonts.length; fi++) { #' + '# var font = fonts[fi]; #' + '<font>' + '# if (font.fontSize) { #' + '<sz val="${font.fontSize}" />' + '# } else { #' + '<sz val="11" />' + '# } #' + '# if (font.bold) { #' + '<b/>' + '# } #' + '# if (font.italic) { #' + '<i/>' + '# } #' + '# if (font.underline) { #' + '<u/>' + '# } #' + '# if (font.color) { #' + '<color rgb="${font.color}" />' + '# } else { #' + '<color theme="1" />' + '# } #' + '# if (font.fontFamily) { #' + '<name val="${font.fontFamily}" />' + '<family val="2" />' + '# } else { #' + '<name val="Calibri" />' + '<family val="2" />' + '<scheme val="minor" />' + '# } #' + '</font>' + '# } #' + '</fonts>' + '<fills count="${fills.length+2}">' + '<fill><patternFill patternType="none"/></fill>' + '<fill><patternFill patternType="gray125"/></fill>' + '# for (var fi = 0; fi < fills.length; fi++) { #' + '# var fill = fills[fi]; #' + '# if (fill.background) { #' + '<fill>' + '<patternFill patternType="solid">' + '<fgColor rgb="${fill.background}"/>' + '</patternFill>' + '</fill>' + '# } #' + '# } #' + '</fills>' + '<borders count="${borders.length+1}">' + '<border><left/><right/><top/><bottom/><diagonal/></border>' + '# for (var bi = 0; bi < borders.length; bi++) { #' + '#= kendo.ooxml.borderTemplate(borders[bi]) #' + '# } #' + '</borders>' + '<cellStyleXfs count="1">' + '<xf borderId="0" fillId="0" fontId="0" />' + '</cellStyleXfs>' + '<cellXfs count="${styles.length+1}">' + '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' + '# for (var si = 0; si < styles.length; si++) { #' + '# var style = styles[si]; #' + '<xf xfId="0"' + '# if (style.fontId) { #' + ' fontId="${style.fontId}" applyFont="1"' + '# } #' + '# if (style.fillId) { #' + ' fillId="${style.fillId}" applyFill="1"' + '# } #' + '# if (style.numFmtId) { #' + ' numFmtId="${style.numFmtId}" applyNumberFormat="1"' + '# } #' + '# if (style.textAlign || style.verticalAlign || style.wrap) { #' + ' applyAlignment="1"' + '# } #' + '# if (style.borderId) { #' + ' borderId="${style.borderId}" applyBorder="1"' + '# } #' + '>' + '# if (style.textAlign || style.verticalAlign || style.wrap) { #' + '<alignment' + '# if (style.textAlign) { #' + ' horizontal="${style.textAlign}"' + '# } #' + '# if (style.verticalAlign) { #' + ' vertical="${style.verticalAlign}"' + '# } #' + '# if (style.wrap) { #' + ' wrapText="1"' + '# } #' + '/>' + '# } #' + '</xf>' + '# } #' + '</cellXfs>' + '<cellStyles count="1">' + '<cellStyle name="Normal" xfId="0" builtinId="0"/>' + '</cellStyles>' + '<dxfs count="0" />' + '<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleMedium9" />' + '</styleSheet>');
        function numChar(colIndex) {
            var letter = Math.floor(colIndex / 26) - 1;
            return (letter >= 0 ? numChar(letter) : '') + String.fromCharCode(65 + colIndex % 26);
        }
        function ref(rowIndex, colIndex) {
            return numChar(colIndex) + (rowIndex + 1);
        }
        function $ref(rowIndex, colIndex) {
            return numChar(colIndex) + '$' + (rowIndex + 1);
        }
        function filterRowIndex(options) {
            var frozenRows = options.frozenRows || (options.freezePane || {}).rowSplit || 1;
            return frozenRows - 1;
        }
        function toWidth(px) {
            return (px / 7 * 100 + 0.5) / 100;
        }
        function toHeight(px) {
            return px * 0.75;
        }
        function stripFunnyChars(value) {
            return (value + '').replace(/[\x00-\x08]/g, '').replace(/\n/g, '\r\n');
        }
        var DATE_EPOCH = new Date(1900, 0, 0);
        var Worksheet = kendo.Class.extend({
            init: function (options, sharedStrings, styles, borders) {
                this.options = options;
                this._strings = sharedStrings;
                this._styles = styles;
                this._borders = borders;
                this._validations = {};
            },
            relsToXML: function () {
                var hyperlinks = this.options.hyperlinks || [];
                if (!hyperlinks.length) {
                    return '';
                }
                return WORKSHEET_RELS({ hyperlinks: hyperlinks });
            },
            toXML: function (index) {
                var mergeCells = this.options.mergedCells || [];
                var rows = this.options.rows || [];
                var data = inflate(rows, mergeCells);
                this._readCells(data);
                var filter = this.options.filter;
                if (filter && typeof filter.from === 'number' && typeof filter.to === 'number') {
                    filter = {
                        from: ref(filterRowIndex(this.options), filter.from),
                        to: ref(filterRowIndex(this.options), filter.to)
                    };
                }
                var validations = [];
                for (var i in this._validations) {
                    if (Object.prototype.hasOwnProperty.call(this._validations, i)) {
                        validations.push(this._validations[i]);
                    }
                }
                var defaultCellStyleId = null;
                if (this.options.defaultCellStyle) {
                    defaultCellStyleId = this._lookupStyle(this.options.defaultCellStyle);
                }
                var freezePane = this.options.freezePane || {};
                return WORKSHEET({
                    frozenColumns: this.options.frozenColumns || freezePane.colSplit,
                    frozenRows: this.options.frozenRows || freezePane.rowSplit,
                    columns: this.options.columns,
                    defaults: this.options.defaults || {},
                    data: data,
                    index: index,
                    mergeCells: mergeCells,
                    filter: filter,
                    showGridLines: this.options.showGridLines,
                    hyperlinks: this.options.hyperlinks || [],
                    validations: validations,
                    defaultCellStyleId: defaultCellStyleId
                });
            },
            _lookupString: function (value) {
                var key = '$' + value;
                var index = this._strings.indexes[key];
                if (index !== undefined) {
                    value = index;
                } else {
                    value = this._strings.indexes[key] = this._strings.uniqueCount;
                    this._strings.uniqueCount++;
                }
                this._strings.count++;
                return value;
            },
            _lookupStyle: function (style) {
                var json = kendo.stringify(style);
                if (json == '{}') {
                    return 0;
                }
                var index = $.inArray(json, this._styles);
                if (index < 0) {
                    index = this._styles.push(json) - 1;
                }
                return index + 1;
            },
            _lookupBorder: function (border) {
                var json = kendo.stringify(border);
                if (json == '{}') {
                    return;
                }
                var index = $.inArray(json, this._borders);
                if (index < 0) {
                    index = this._borders.push(json) - 1;
                }
                return index + 1;
            },
            _readCells: function (rowData) {
                for (var i = 0; i < rowData.length; i++) {
                    var row = rowData[i];
                    var cells = row.cells;
                    row.data = [];
                    for (var j = 0; j < cells.length; j++) {
                        var cellData = this._cell(cells[j], row.index, j);
                        if (cellData) {
                            row.data.push(cellData);
                        }
                    }
                }
            },
            _cell: function (data, rowIndex, cellIndex) {
                if (!data || data === EMPTY_CELL) {
                    return null;
                }
                var value = data.value;
                var border = {};
                if (data.borderLeft) {
                    border.left = data.borderLeft;
                }
                if (data.borderRight) {
                    border.right = data.borderRight;
                }
                if (data.borderTop) {
                    border.top = data.borderTop;
                }
                if (data.borderBottom) {
                    border.bottom = data.borderBottom;
                }
                border = this._lookupBorder(border);
                var defStyle = this.options.defaultCellStyle || {};
                var style = { borderId: border };
                (function (add) {
                    add('color');
                    add('background');
                    add('bold');
                    add('italic');
                    add('underline');
                    if (!add('fontFamily')) {
                        add('fontName', 'fontFamily');
                    }
                    add('fontSize');
                    add('format');
                    if (!add('textAlign')) {
                        add('hAlign', 'textAlign');
                    }
                    if (!add('verticalAlign')) {
                        add('vAlign', 'verticalAlign');
                    }
                    add('wrap');
                }(function (prop, target) {
                    var val = data[prop];
                    if (val === undefined) {
                        val = defStyle[prop];
                    }
                    if (val !== undefined) {
                        style[target || prop] = val;
                        return true;
                    }
                }));
                var columns = this.options.columns || [];
                var column = columns[cellIndex];
                var type = typeof value;
                if (column && column.autoWidth) {
                    var displayValue = value;
                    if (type === 'number') {
                        displayValue = kendo.toString(value, data.format);
                    }
                    column.width = Math.max(column.width || 0, (displayValue + '').length);
                }
                if (type === 'string') {
                    value = stripFunnyChars(value);
                    value = this._lookupString(value);
                    type = 's';
                } else if (type === 'number') {
                    type = 'n';
                } else if (type === 'boolean') {
                    type = 'b';
                    value = +value;
                } else if (value && value.getTime) {
                    type = null;
                    var offset = (value.getTimezoneOffset() - DATE_EPOCH.getTimezoneOffset()) * kendo.date.MS_PER_MINUTE;
                    value = (value - DATE_EPOCH - offset) / kendo.date.MS_PER_DAY + 1;
                    if (!style.format) {
                        style.format = 'mm-dd-yy';
                    }
                } else {
                    type = null;
                    value = null;
                }
                style = this._lookupStyle(style);
                var cellName = ref(rowIndex, cellIndex);
                if (data.validation) {
                    this._addValidation(data.validation, cellName);
                }
                return {
                    value: value,
                    formula: data.formula,
                    type: type,
                    style: style,
                    ref: cellName
                };
            },
            _addValidation: function (v, ref) {
                var tmp = {
                    showErrorMessage: v.type == 'reject' ? 1 : 0,
                    formula1: v.from,
                    formula2: v.to,
                    type: MAP_EXCEL_TYPE[v.dataType] || v.dataType,
                    operator: MAP_EXCEL_OPERATOR[v.comparerType] || v.comparerType,
                    allowBlank: v.allowNulls ? 1 : 0,
                    showDropDown: v.showButton ? 0 : 1,
                    error: v.messageTemplate,
                    errorTitle: v.titleTemplate
                };
                var json = JSON.stringify(tmp);
                if (!this._validations[json]) {
                    this._validations[json] = tmp;
                    tmp.sqref = [];
                }
                this._validations[json].sqref.push(ref);
            }
        });
        var MAP_EXCEL_OPERATOR = {
            greaterThanOrEqualTo: 'greaterThanOrEqual',
            lessThanOrEqualTo: 'lessThanOrEqual'
        };
        var MAP_EXCEL_TYPE = { number: 'decimal' };
        var defaultFormats = {
            'General': 0,
            '0': 1,
            '0.00': 2,
            '#,##0': 3,
            '#,##0.00': 4,
            '0%': 9,
            '0.00%': 10,
            '0.00E+00': 11,
            '# ?/?': 12,
            '# ??/??': 13,
            'mm-dd-yy': 14,
            'd-mmm-yy': 15,
            'd-mmm': 16,
            'mmm-yy': 17,
            'h:mm AM/PM': 18,
            'h:mm:ss AM/PM': 19,
            'h:mm': 20,
            'h:mm:ss': 21,
            'm/d/yy h:mm': 22,
            '#,##0 ;(#,##0)': 37,
            '#,##0 ;[Red](#,##0)': 38,
            '#,##0.00;(#,##0.00)': 39,
            '#,##0.00;[Red](#,##0.00)': 40,
            'mm:ss': 45,
            '[h]:mm:ss': 46,
            'mmss.0': 47,
            '##0.0E+0': 48,
            '@': 49,
            '[$-404]e/m/d': 27,
            'm/d/yy': 30,
            't0': 59,
            't0.00': 60,
            't#,##0': 61,
            't#,##0.00': 62,
            't0%': 67,
            't0.00%': 68,
            't# ?/?': 69,
            't# ??/??': 70
        };
        function convertColor(color) {
            if (color.length < 6) {
                color = color.replace(/(\w)/g, function ($0, $1) {
                    return $1 + $1;
                });
            }
            color = color.substring(1).toUpperCase();
            if (color.length < 8) {
                color = 'FF' + color;
            }
            return color;
        }
        var Workbook = kendo.Class.extend({
            init: function (options) {
                this.options = options || {};
                this._strings = {
                    indexes: {},
                    count: 0,
                    uniqueCount: 0
                };
                this._styles = [];
                this._borders = [];
                this._sheets = $.map(this.options.sheets || [], $.proxy(function (options) {
                    options.defaults = this.options;
                    return new Worksheet(options, this._strings, this._styles, this._borders);
                }, this));
            },
            toDataURL: function () {
                if (typeof JSZip === 'undefined') {
                    throw new Error('JSZip not found. Check http://docs.telerik.com/kendo-ui/framework/excel/introduction#requirements for more details.');
                }
                var zip = new JSZip();
                var docProps = zip.folder('docProps');
                docProps.file('core.xml', CORE({
                    creator: this.options.creator || 'Kendo UI',
                    lastModifiedBy: this.options.creator || 'Kendo UI',
                    created: this.options.date || new Date().toJSON(),
                    modified: this.options.date || new Date().toJSON()
                }));
                var sheetCount = this._sheets.length;
                docProps.file('app.xml', APP({ sheets: this._sheets }));
                var rels = zip.folder('_rels');
                rels.file('.rels', RELS);
                var xl = zip.folder('xl');
                var xlRels = xl.folder('_rels');
                xlRels.file('workbook.xml.rels', WORKBOOK_RELS({ count: sheetCount }));
                var sheetIds = {};
                xl.file('workbook.xml', WORKBOOK({
                    sheets: this._sheets,
                    filterNames: $.map(this._sheets, function (sheet, index) {
                        var options = sheet.options;
                        var sheetName = options.name || options.title || 'Sheet' + (index + 1);
                        sheetIds[sheetName.toLowerCase()] = index;
                        var filter = options.filter;
                        if (filter && typeof filter.from !== 'undefined' && typeof filter.to !== 'undefined') {
                            return {
                                localSheetId: index,
                                name: sheetName,
                                from: $ref(filterRowIndex(options), filter.from),
                                to: $ref(filterRowIndex(options), filter.to)
                            };
                        }
                    }),
                    userNames: $.map(this.options.names || [], function (def) {
                        return {
                            name: def.localName,
                            localSheetId: def.sheet ? sheetIds[def.sheet.toLowerCase()] : null,
                            value: def.value,
                            hidden: def.hidden
                        };
                    })
                }));
                var worksheets = xl.folder('worksheets');
                var sheetRels = worksheets.folder('_rels');
                for (var idx = 0; idx < sheetCount; idx++) {
                    var sheet = this._sheets[idx];
                    var sheetName = kendo.format('sheet{0}.xml', idx + 1);
                    var relsXml = sheet.relsToXML();
                    if (relsXml) {
                        sheetRels.file(sheetName + '.rels', relsXml);
                    }
                    worksheets.file(sheetName, sheet.toXML(idx));
                }
                var borders = $.map(this._borders, $.parseJSON);
                var styles = $.map(this._styles, $.parseJSON);
                var hasFont = function (style) {
                    return style.underline || style.bold || style.italic || style.color || style.fontFamily || style.fontSize;
                };
                var fonts = $.map(styles, function (style) {
                    if (style.color) {
                        style.color = convertColor(style.color);
                    }
                    if (hasFont(style)) {
                        return style;
                    }
                });
                var formats = $.map(styles, function (style) {
                    if (style.format && defaultFormats[style.format] === undefined) {
                        return style;
                    }
                });
                var fills = $.map(styles, function (style) {
                    if (style.background) {
                        style.background = convertColor(style.background);
                        return style;
                    }
                });
                xl.file('styles.xml', STYLES({
                    fonts: fonts,
                    fills: fills,
                    formats: formats,
                    borders: borders,
                    styles: $.map(styles, function (style) {
                        var result = {};
                        if (hasFont(style)) {
                            result.fontId = $.inArray(style, fonts) + 1;
                        }
                        if (style.background) {
                            result.fillId = $.inArray(style, fills) + 2;
                        }
                        result.textAlign = style.textAlign;
                        result.verticalAlign = style.verticalAlign;
                        result.wrap = style.wrap;
                        result.borderId = style.borderId;
                        if (style.format) {
                            if (defaultFormats[style.format] !== undefined) {
                                result.numFmtId = defaultFormats[style.format];
                            } else {
                                result.numFmtId = 165 + $.inArray(style, formats);
                            }
                        }
                        return result;
                    })
                }));
                xl.file('sharedStrings.xml', SHARED_STRINGS(this._strings));
                zip.file('[Content_Types].xml', CONTENT_TYPES({ count: sheetCount }));
                return 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + zip.generate({ compression: 'DEFLATE' });
            }
        });
        function borderStyle(width) {
            var alias = 'thin';
            if (width === 2) {
                alias = 'medium';
            } else if (width === 3) {
                alias = 'thick';
            }
            return alias;
        }
        function borderSideTemplate(name, style) {
            var result = '';
            if (style) {
                result += '<' + name + ' style="' + borderStyle(style.size) + '">';
                if (style.color) {
                    result += '<color rgb="' + convertColor(style.color) + '"/>';
                }
                result += '</' + name + '>';
            }
            return result;
        }
        function borderTemplate(border) {
            return '<border>' + borderSideTemplate('left', border.left) + borderSideTemplate('right', border.right) + borderSideTemplate('top', border.top) + borderSideTemplate('bottom', border.bottom) + '</border>';
        }
        var EMPTY_CELL = {};
        function inflate(rows, mergedCells) {
            var rowData = [];
            var rowsByIndex = [];
            indexRows(rows, function (row, index) {
                var data = {
                    _source: row,
                    index: index,
                    height: row.height,
                    cells: []
                };
                rowData.push(data);
                rowsByIndex[index] = data;
            });
            var sorted = sortByIndex(rowData).slice(0);
            var ctx = {
                rowData: rowData,
                rowsByIndex: rowsByIndex,
                mergedCells: mergedCells
            };
            for (var i = 0; i < sorted.length; i++) {
                fillCells(sorted[i], ctx);
                delete sorted[i]._source;
            }
            return sortByIndex(rowData);
        }
        function indexRows(rows, callback) {
            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                if (!row) {
                    continue;
                }
                var index = row.index;
                if (typeof index !== 'number') {
                    index = i;
                }
                callback(row, index);
            }
        }
        function sortByIndex(items) {
            return items.sort(function (a, b) {
                return a.index - b.index;
            });
        }
        function fillCells(data, ctx) {
            var row = data._source;
            var rowIndex = data.index;
            var cells = row.cells;
            var cellData = data.cells;
            if (!cells) {
                return;
            }
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i] || EMPTY_CELL;
                var rowSpan = cell.rowSpan || 1;
                var colSpan = cell.colSpan || 1;
                var cellIndex = insertCell(cellData, cell);
                spanCell(cell, cellData, cellIndex, colSpan);
                if (rowSpan > 1 || colSpan > 1) {
                    ctx.mergedCells.push(ref(rowIndex, cellIndex) + ':' + ref(rowIndex + rowSpan - 1, cellIndex + colSpan - 1));
                }
                if (rowSpan > 1) {
                    for (var ri = rowIndex + 1; ri < rowIndex + rowSpan; ri++) {
                        var nextRow = ctx.rowsByIndex[ri];
                        if (!nextRow) {
                            nextRow = ctx.rowsByIndex[ri] = {
                                index: ri,
                                cells: []
                            };
                            ctx.rowData.push(nextRow);
                        }
                        spanCell(cell, nextRow.cells, cellIndex - 1, colSpan + 1);
                    }
                }
            }
        }
        function insertCell(data, cell) {
            var index;
            if (typeof cell.index === 'number') {
                index = cell.index;
                insertCellAt(data, cell, cell.index);
            } else {
                index = appendCell(data, cell);
            }
            return index;
        }
        function insertCellAt(data, cell, index) {
            data[index] = cell;
        }
        function appendCell(data, cell) {
            var index = data.length;
            for (var i = 0; i < data.length + 1; i++) {
                if (!data[i]) {
                    data[i] = cell;
                    index = i;
                    break;
                }
            }
            return index;
        }
        function spanCell(cell, row, startIndex, colSpan) {
            for (var i = 1; i < colSpan; i++) {
                var tmp = {
                    borderTop: cell.borderTop,
                    borderRight: cell.borderRight,
                    borderBottom: cell.borderBottom,
                    borderLeft: cell.borderLeft
                };
                insertCellAt(row, tmp, startIndex + i);
            }
        }
        kendo.ooxml = {
            Workbook: Workbook,
            Worksheet: Worksheet,
            toWidth: toWidth,
            toHeight: toHeight,
            borderTemplate: borderTemplate
        };
    }(kendo.jQuery, kendo));
    return kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));