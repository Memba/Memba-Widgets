/** 
 * Kendo UI v2022.1.119 (http://www.telerik.com/kendo-ui)                                                                                                                                               
 * Copyright 2022 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.                                                                                      
 *                                                                                                                                                                                                      
 * Kendo UI commercial licenses may be obtained at                                                                                                                                                      
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete                                                                                                                                  
 * If you do not own a commercial license, this file shall be governed by the trial license terms.                                                                                                      
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       
                                                                                                                                                                                                       

*/
(function (f, define) {
    define('pivotgrid/common', ['kendo.core'], f);
}(function () {
    (function () {
        window.kendo.pivotgrid = window.kendo.pivotgrid || {};
        window.kendo.pivotgrid.common = function (exports) {
            var filterFunctionFormats = {
                contains: ', InStr({0}.CurrentMember.MEMBER_CAPTION,"{1}") > 0',
                doesnotcontain: ', InStr({0}.CurrentMember.MEMBER_CAPTION,"{1}")',
                endswith: ', Right({0}.CurrentMember.MEMBER_CAPTION,Len("{1}"))="{1}"',
                eq: ', {0}.CurrentMember.MEMBER_CAPTION = "{1}"',
                neq: ', {0}.CurrentMember.MEMBER_CAPTION = "{1}"',
                startswith: ', Left({0}.CurrentMember.MEMBER_CAPTION,Len("{1}"))="{1}"'
            };
            var operators = {
                doesnotcontain: 'doesnotcontain',
                in: 'in',
                neq: 'neq'
            };
            function serializeFilters(filters, cube) {
                var command = '';
                var current = '';
                for (var idx = filters.length - 1; idx >= 0; idx--) {
                    current = 'SELECT (';
                    current += serializeExpression(filters[idx]);
                    current += ') ON 0';
                    if (idx === filters.length - 1) {
                        current += ' FROM [' + cube + ']';
                        command = current;
                    } else {
                        command = current + ' FROM ( ' + command + ' )';
                    }
                }
                return command;
            }
            function serializeExpression(expression) {
                var command = '';
                var value = String(expression.value);
                var field = expression.field;
                var operator = expression.operator;
                if (operator === operators.in) {
                    command += '{';
                    command += value;
                    command += '}';
                } else {
                    command += operator === operators.neq || operator === operators.doesnotcontain ? '-' : '';
                    command += 'Filter(';
                    command += field + '.MEMBERS';
                    command += formatString(filterFunctionFormats[operator], field, value);
                    command += ')';
                }
                return command;
            }
            function formatString(str) {
                var values = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    values[_i - 1] = arguments[_i];
                }
                values.forEach(function (value, index) {
                    str = str.replace(new RegExp('\\{' + index + '\\}', 'g'), value);
                });
                return str;
            }
            function serializeMembers(members, measures, sort) {
                var command = '';
                members = members || [];
                var parsed = parseDescriptors(members);
                var expanded = parsed.expanded;
                var rootNames = getRootNames(parsed.root);
                var crossJoinCommands = [];
                var length = expanded.length;
                var idx = 0;
                var memberName;
                var names = [];
                if (rootNames.length > 1 || measures.length > 1) {
                    crossJoinCommands.push(crossJoinCommand(rootNames, measures));
                    for (; idx < length; idx++) {
                        memberName = expandMemberDescriptor(expanded[idx].name, sort);
                        names = mapNames(memberName, rootNames);
                        crossJoinCommands.push(crossJoinCommand(names, measures));
                    }
                    command += crossJoinCommands.join(',');
                } else {
                    for (; idx < length; idx++) {
                        memberName = expandMemberDescriptor(expanded[idx].name, sort);
                        names.push(memberName[0]);
                    }
                    command += rootNames.concat(names).join(',');
                }
                return command;
            }
            function measureNames(measures) {
                var length = measures.length;
                var result = [];
                var measure;
                for (var idx = 0; idx < length; idx++) {
                    measure = measures[idx];
                    result.push(measure.name !== undefined ? measure.name : measure);
                }
                return result;
            }
            function getRootNames(members) {
                var root = [];
                members.forEach(function (member) {
                    var name = member.name[0];
                    var hierarchyName = baseHierarchyPath(name);
                    if (!root.some(function (n) {
                            return n.indexOf(hierarchyName) === 0;
                        })) {
                        root.push(name);
                    }
                });
                return root;
            }
            function parseDescriptors(members) {
                var expanded = [];
                var child = [];
                var root = [];
                var idx = 0;
                var found;
                for (; idx < members.length; idx++) {
                    var member = members[idx];
                    var name_1 = member.name;
                    found = false;
                    if (name_1.length > 1) {
                        child.push(member);
                    } else {
                        var hierarchyName = baseHierarchyPath(name_1[0]);
                        for (var j = 0, l = root.length; j < l; j++) {
                            if (root[j].name[0].indexOf(hierarchyName) === 0) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            root.push(member);
                        }
                        if (member.expand) {
                            expanded.push(member);
                        }
                    }
                }
                expanded = expanded.concat(child);
                return {
                    expanded: expanded,
                    root: root
                };
            }
            function mapNames(names, rootNames) {
                var rootLength = rootNames.length;
                rootNames = rootNames.slice(0);
                for (var idx = 0; idx < names.length; idx++) {
                    var name_2 = names[idx];
                    for (var j = 0; j < rootLength; j++) {
                        var rootName = baseHierarchyPath(rootNames[j]);
                        if (name_2.indexOf(rootName) !== -1) {
                            rootNames[j] = name_2;
                            break;
                        }
                    }
                }
                return rootNames;
            }
            function crossJoinCommand(members, measures) {
                var tmp = members.slice(0);
                if (measures.length > 1) {
                    tmp.push('{' + measureNames(measures).join(',') + '}');
                }
                return crossJoin(tmp);
            }
            function expandMemberDescriptor(names, sort) {
                var idx = names.length - 1;
                var name = names[idx];
                var sortDescriptor = sortDescriptorForMember(sort, name);
                if (sortDescriptor && sortDescriptor.dir) {
                    name = 'ORDER(' + name + '.Children,' + sortDescriptor.field + '.CurrentMember.MEMBER_CAPTION,' + sortDescriptor.dir + ')';
                } else {
                    name += '.Children';
                }
                names[idx] = name;
                return names;
            }
            function sortDescriptorForMember(sort, member) {
                for (var idx = 0, length_1 = sort.length; idx < length_1; idx++) {
                    if (member.indexOf(sort[idx].field) === 0) {
                        return sort[idx];
                    }
                }
                return null;
            }
            function baseHierarchyPath(memberName) {
                var parts = memberName.split('.');
                if (parts.length > 2) {
                    return parts[0] + '.' + parts[1];
                }
                return memberName;
            }
            function crossJoin(names) {
                var result = 'CROSSJOIN({';
                var name;
                if (names.length > 2) {
                    name = names.pop();
                    result += crossJoin(names);
                } else {
                    result += names.shift();
                    name = names.pop();
                }
                result += '},{';
                result += name;
                result += '})';
                return result;
            }
            function createRequestBody(options) {
                var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Execute xmlns="urn:schemas-microsoft-com:xml-analysis"><Command><Statement>';
                var _a = options.columnAxes, columnAxes = _a === void 0 ? [] : _a, _b = options.rowAxes, rowAxes = _b === void 0 ? [] : _b;
                var _c = options.measureAxes, measureAxes = _c === void 0 ? [] : _c, _d = options.sort, sort = _d === void 0 ? [] : _d, _e = options.filter, filter = _e === void 0 ? [] : _e;
                var measuresRowAxis = options.measuresAxis === 'rows';
                command += 'SELECT NON EMPTY {';
                if (!columnAxes.length && rowAxes.length && (!measureAxes.length || measureAxes.length && measuresRowAxis)) {
                    columnAxes = rowAxes;
                    rowAxes = [];
                    measuresRowAxis = false;
                }
                if (!columnAxes.length && !rowAxes.length) {
                    measuresRowAxis = false;
                }
                if (columnAxes.length) {
                    command += serializeMembers(columnAxes, !measuresRowAxis ? measureAxes : [], sort);
                } else if (measureAxes.length && !measuresRowAxis) {
                    command += measureNames(measureAxes).join(',');
                }
                command += '} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON COLUMNS';
                if (rowAxes.length || measuresRowAxis && measureAxes.length > 1) {
                    command += ', NON EMPTY {';
                    if (rowAxes.length) {
                        command += serializeMembers(rowAxes, measuresRowAxis ? measureAxes : [], sort);
                    } else {
                        command += measureNames(measureAxes).join(',');
                    }
                    command += '} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON ROWS';
                }
                if (filter.length) {
                    command += ' FROM ';
                    command += '(';
                    command += serializeFilters(filter, options.connection.cube);
                    command += ')';
                } else {
                    command += ' FROM [' + options.connection.cube + ']';
                }
                if (measureAxes.length === 1 && columnAxes.length) {
                    command += ' WHERE (' + measureNames(measureAxes).join(',') + ')';
                }
                command += '</Statement></Command><Properties><PropertyList><Catalog>' + options.connection.catalog + '</Catalog><Format>Multidimensional</Format></PropertyList></Properties></Execute></Body></Envelope>';
                return command.replace(/&/g, '&amp;');
            }
            var __assign = function () {
                __assign = Object.assign || function __assign(t) {
                    for (var s, i = 1, n = arguments.length; i < n; i++) {
                        s = arguments[i];
                        for (var p in s)
                            if (Object.prototype.hasOwnProperty.call(s, p))
                                t[p] = s[p];
                    }
                    return t;
                };
                return __assign.apply(this, arguments);
            };
            function __awaiter(thisArg, _arguments, P, generator) {
                function adopt(value) {
                    return value instanceof P ? value : new P(function (resolve) {
                        resolve(value);
                    });
                }
                return new (P || (P = Promise))(function (resolve, reject) {
                    function fulfilled(value) {
                        try {
                            step(generator.next(value));
                        } catch (e) {
                            reject(e);
                        }
                    }
                    function rejected(value) {
                        try {
                            step(generator['throw'](value));
                        } catch (e) {
                            reject(e);
                        }
                    }
                    function step(result) {
                        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
                    }
                    step((generator = generator.apply(thisArg, _arguments || [])).next());
                });
            }
            function __generator(thisArg, body) {
                var _ = {
                        label: 0,
                        sent: function () {
                            if (t[0] & 1)
                                throw t[1];
                            return t[1];
                        },
                        trys: [],
                        ops: []
                    }, f, y, t, g;
                return g = {
                    next: verb(0),
                    'throw': verb(1),
                    'return': verb(2)
                }, typeof Symbol === 'function' && (g[Symbol.iterator] = function () {
                    return this;
                }), g;
                function verb(n) {
                    return function (v) {
                        return step([
                            n,
                            v
                        ]);
                    };
                }
                function step(op) {
                    if (f)
                        throw new TypeError('Generator is already executing.');
                    while (_)
                        try {
                            if (f = 1, y && (t = op[0] & 2 ? y['return'] : op[0] ? y['throw'] || ((t = y['return']) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                                return t;
                            if (y = 0, t)
                                op = [
                                    op[0] & 2,
                                    t.value
                                ];
                            switch (op[0]) {
                            case 0:
                            case 1:
                                t = op;
                                break;
                            case 4:
                                _.label++;
                                return {
                                    value: op[1],
                                    done: false
                                };
                            case 5:
                                _.label++;
                                y = op[1];
                                op = [0];
                                continue;
                            case 7:
                                op = _.ops.pop();
                                _.trys.pop();
                                continue;
                            default:
                                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                    _ = 0;
                                    continue;
                                }
                                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                                    _.label = op[1];
                                    break;
                                }
                                if (op[0] === 6 && _.label < t[1]) {
                                    _.label = t[1];
                                    t = op;
                                    break;
                                }
                                if (t && _.label < t[2]) {
                                    _.label = t[2];
                                    _.ops.push(op);
                                    break;
                                }
                                if (t[2])
                                    _.ops.pop();
                                _.trys.pop();
                                continue;
                            }
                            op = body.call(thisArg, _);
                        } catch (e) {
                            op = [
                                6,
                                e
                            ];
                            y = 0;
                        } finally {
                            f = t = 0;
                        }
                    if (op[0] & 5)
                        throw op[1];
                    return {
                        value: op[0] ? op[1] : void 0,
                        done: true
                    };
                }
            }
            function __spreadArrays() {
                for (var s = 0, i = 0, il = arguments.length; i < il; i++)
                    s += arguments[i].length;
                for (var r = Array(s), k = 0, i = 0; i < il; i++)
                    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                        r[k] = a[j];
                return r;
            }
            function parseResponse(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var axes = Array.from(xmlDoc.querySelectorAll('Axis'));
                var cells = Array.from(xmlDoc.querySelectorAll('CellData > Cell')).map(function (cell) {
                    return {
                        fmtValue: getPropertyValue(cell, 'FmtValue'),
                        ordinal: parseInt(cell.getAttribute('CellOrdinal'), 10),
                        value: getPropertyValue(cell, 'Value')
                    };
                });
                var columns = { tuples: [] };
                var rows = { tuples: [] };
                var data = [];
                axes.forEach(function (axis) {
                    if (axis.getAttribute('name') !== 'SlicerAxis') {
                        var tuples = columns.tuples.length === 0 ? columns.tuples : rows.tuples;
                        Array.prototype.push.apply(tuples, translateAxis(axis));
                    }
                });
                var indexedData = new Array(rows.tuples.length * columns.tuples.length).fill(null);
                cells.forEach(function (c) {
                    indexedData[c.ordinal] = c;
                });
                var counter = 0;
                rows.tuples.forEach(function (rowTuple) {
                    columns.tuples.forEach(function (colTuple) {
                        data.push({
                            columnTuple: colTuple,
                            data: indexedData[counter],
                            rowTuple: rowTuple
                        });
                        counter++;
                    });
                });
                return {
                    columns: columns,
                    data: data,
                    rows: rows
                };
            }
            function getPropertyValue(member, name) {
                var node = member.querySelector(name);
                return node ? node.textContent : '';
            }
            function translateAxis(axis) {
                var tuples = Array.from(axis.querySelectorAll('Tuple'));
                return tuples.map(function (tuple) {
                    var memberElements = Array.from(tuple.querySelectorAll('Member'));
                    var members = memberElements.map(function (member) {
                        var lNum = parseInt(getPropertyValue(member, 'LNum') || '0', 10);
                        var hasChildren = parseInt(getPropertyValue(member, 'CHILDREN_CARDINALITY') || '0', 10) > 0;
                        return {
                            caption: getPropertyValue(member, 'Caption'),
                            children: [],
                            hasChildren: hasChildren,
                            hierarchy: member.getAttribute('Hierarchy'),
                            levelName: getPropertyValue(member, 'LName'),
                            levelNum: lNum,
                            name: getPropertyValue(member, 'UName'),
                            parentName: getPropertyValue(member, 'PARENT_UNIQUE_NAME')
                        };
                    });
                    return { members: members };
                });
            }
            var discoverCommands = {
                schemaCatalogs: 'DBSCHEMA_CATALOGS',
                schemaCubes: 'MDSCHEMA_CUBES',
                schemaDimensions: 'MDSCHEMA_DIMENSIONS',
                schemaHierarchies: 'MDSCHEMA_HIERARCHIES',
                schemaKPIs: 'MDSCHEMA_KPIS',
                schemaLevels: 'MDSCHEMA_LEVELS',
                schemaMeasures: 'MDSCHEMA_MEASURES',
                schemaMembers: 'MDSCHEMA_MEMBERS'
            };
            function createDiscoverBody(options) {
                var properties = {};
                var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Discover xmlns="urn:schemas-microsoft-com:xml-analysis">';
                command += '<RequestType>' + (discoverCommands[options.command] || options.command) + '</RequestType>';
                command += '<Restrictions>' + serializeOptions('RestrictionList', options.restrictions, true) + '</Restrictions>';
                if (options.connection && options.connection.catalog) {
                    properties.Catalog = options.connection.catalog;
                }
                command += '<Properties>' + serializeOptions('PropertyList', properties, false) + '</Properties>';
                command += '</Discover></Body></Envelope>';
                return command;
            }
            function serializeOptions(parentTagName, options, capitalize) {
                var result = '';
                if (options) {
                    result += '<' + parentTagName + '>';
                    var value = void 0;
                    for (var key in options) {
                        if (options[key]) {
                            value = options[key];
                            if (capitalize) {
                                key = key.replace(/([A-Z]+(?=$|[A-Z][a-z])|[A-Z]?[a-z]+)/g, '$1_').toUpperCase().replace(/_$/, '');
                            }
                            result += '<' + key + '>' + value + '</' + key + '>';
                        }
                    }
                    result += '</' + parentTagName + '>';
                } else {
                    result += '<' + parentTagName + '/>';
                }
                return result;
            }
            function parseCubes(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        name: getPropertyValue(row, 'CUBE_NAME'),
                        caption: getPropertyValue(row, 'CUBE_CAPTION'),
                        description: getPropertyValue(row, 'DESCRIPTION'),
                        type: getPropertyValue(row, 'CUBE_TYPE')
                    };
                });
                return rows;
            }
            function parseCatalogs(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        name: getPropertyValue(row, 'CATALOG_NAME'),
                        description: getPropertyValue(row, 'DESCRIPTION')
                    };
                });
                return rows;
            }
            function parseMeasures(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        name: getPropertyValue(row, 'MEASURE_NAME'),
                        caption: getPropertyValue(row, 'MEASURE_CAPTION'),
                        uniqueName: getPropertyValue(row, 'MEASURE_UNIQUE_NAME'),
                        description: getPropertyValue(row, 'DESCRIPTION'),
                        aggregator: getPropertyValue(row, 'MEASURE_AGGREGATOR'),
                        groupName: getPropertyValue(row, 'MEASUREGROUP_NAME'),
                        displayFolder: getPropertyValue(row, 'MEASURE_DISPLAY_FOLDER'),
                        defaultFormat: getPropertyValue(row, 'DEFAULT_FORMAT_STRING')
                    };
                });
                return rows;
            }
            function parseKPIs(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        name: getPropertyValue(row, 'KPI_NAME'),
                        uniqueName: getPropertyValue(row, 'KPI_NAME'),
                        caption: getPropertyValue(row, 'KPI_CAPTION'),
                        value: getPropertyValue(row, 'KPI_VALUE'),
                        goal: getPropertyValue(row, 'KPI_GOAL'),
                        status: getPropertyValue(row, 'KPI_STATUS'),
                        trend: getPropertyValue(row, 'KPI_TREND'),
                        statusGraphic: getPropertyValue(row, 'KPI_STATUS_GRAPHIC'),
                        trendGraphic: getPropertyValue(row, 'KPI_TREND_GRAPHIC'),
                        description: getPropertyValue(row, 'KPI_DESCRIPTION'),
                        groupName: getPropertyValue(row, 'MEASUREGROUP_NAME'),
                        type: 'kpi'
                    };
                });
                return rows;
            }
            function parseDimensions(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        caption: getPropertyValue(row, 'DIMENSION_CAPTION'),
                        defaultHierarchy: getPropertyValue(row, 'DEFAULT_HIERARCHY'),
                        description: getPropertyValue(row, 'DESCRIPTION'),
                        name: getPropertyValue(row, 'DIMENSION_NAME'),
                        type: parseInt(getPropertyValue(row, 'DIMENSION_TYPE'), 10),
                        uniqueName: getPropertyValue(row, 'DIMENSION_UNIQUE_NAME')
                    };
                });
                return rows;
            }
            function parseHierarchies(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        name: getPropertyValue(row, 'HIERARCHY_NAME'),
                        caption: getPropertyValue(row, 'HIERARCHY_CAPTION'),
                        description: getPropertyValue(row, 'DESCRIPTION'),
                        uniqueName: getPropertyValue(row, 'HIERARCHY_UNIQUE_NAME'),
                        dimensionUniqueName: getPropertyValue(row, 'DIMENSION_UNIQUE_NAME'),
                        displayFolder: getPropertyValue(row, 'HIERARCHY_DISPLAY_FOLDER'),
                        origin: getPropertyValue(row, 'HIERARCHY_ORIGIN'),
                        defaultMember: getPropertyValue(row, 'DEFAULT_MEMBER')
                    };
                });
                return rows;
            }
            function parseLevels(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        name: getPropertyValue(row, 'LEVEL_NAME'),
                        caption: getPropertyValue(row, 'LEVEL_CAPTION'),
                        description: getPropertyValue(row, 'DESCRIPTION'),
                        uniqueName: getPropertyValue(row, 'LEVEL_UNIQUE_NAME'),
                        dimensionUniqueName: getPropertyValue(row, 'DIMENSION_UNIQUE_NAME'),
                        displayFolder: getPropertyValue(row, 'LEVEL_DISPLAY_FOLDER'),
                        orderingProperty: getPropertyValue(row, 'LEVEL_ORDERING_PROPERTY'),
                        origin: getPropertyValue(row, 'LEVEL_ORIGIN'),
                        hierarchyUniqueName: getPropertyValue(row, 'HIERARCHY_UNIQUE_NAME')
                    };
                });
                return rows;
            }
            function parseMembers(response) {
                var xmlDoc = new DOMParser().parseFromString(response, 'text/xml');
                var rows = Array.from(xmlDoc.querySelectorAll('DiscoverResponse > return > root > row')).map(function (row) {
                    return {
                        name: getPropertyValue(row, 'MEMBER_NAME'),
                        caption: getPropertyValue(row, 'MEMBER_CAPTION'),
                        uniqueName: getPropertyValue(row, 'MEMBER_UNIQUE_NAME'),
                        dimensionUniqueName: getPropertyValue(row, 'DIMENSION_UNIQUE_NAME'),
                        hierarchyUniqueName: getPropertyValue(row, 'HIERARCHY_UNIQUE_NAME'),
                        levelUniqueName: getPropertyValue(row, 'LEVEL_UNIQUE_NAME'),
                        childrenCardinality: getPropertyValue(row, 'CHILDREN_CARDINALITY')
                    };
                });
                return rows;
            }
            var discoverParser = {
                schemaCatalogs: parseCatalogs,
                schemaCubes: parseCubes,
                schemaDimensions: parseDimensions,
                schemaHierarchies: parseHierarchies,
                schemaKPIs: parseKPIs,
                schemaLevels: parseLevels,
                schemaMeasures: parseMeasures,
                schemaMembers: parseMembers
            };
            var fetchData = function (fetchOptions, options) {
                return __awaiter(void 0, void 0, void 0, function () {
                    var init, response, stringResponse;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                        case 0:
                            init = __assign({
                                body: createRequestBody(options),
                                headers: { 'Content-Type': 'text/xml' },
                                method: 'POST'
                            }, fetchOptions.init);
                            return [
                                4,
                                fetch(fetchOptions.url, init)
                            ];
                        case 1:
                            response = _a.sent();
                            return [
                                4,
                                response.text()
                            ];
                        case 2:
                            stringResponse = _a.sent();
                            return [
                                2,
                                parseResponse(stringResponse)
                            ];
                        }
                    });
                });
            };
            var fetchDiscover = function (fetchOptions, options) {
                return __awaiter(void 0, void 0, void 0, function () {
                    var init, response, stringResponse;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                        case 0:
                            init = __assign({
                                body: createDiscoverBody(options),
                                headers: { 'Content-Type': 'text/xml' },
                                method: 'POST'
                            }, fetchOptions.init);
                            return [
                                4,
                                fetch(fetchOptions.url, init)
                            ];
                        case 1:
                            response = _a.sent();
                            return [
                                4,
                                response.text()
                            ];
                        case 2:
                            stringResponse = _a.sent();
                            return [
                                2,
                                discoverParser[options.command](stringResponse)
                            ];
                        }
                    });
                });
            };
            var createDataState = function (response) {
                var state = {
                    columns: response.columns.tuples,
                    data: response.data,
                    rows: response.rows.tuples
                };
                return state;
            };
            function createAxisDescriptors(expandTree) {
                var descriptors = [];
                for (var _i = 0, _a = Object.keys(expandTree); _i < _a.length; _i++) {
                    var key = _a[_i];
                    descriptors.push({
                        name: JSON.parse(key),
                        expand: expandTree[key]
                    });
                }
                return descriptors;
            }
            var setSort = function (options, sort) {
                if (sort === void 0) {
                    sort = [];
                }
                options.sort = sort;
            };
            var setFilter = function (options, filter) {
                if (filter === void 0) {
                    filter = [];
                }
                options.filter = filter;
            };
            var getMaxNesting = function (node, set) {
                if (set === void 0) {
                    set = new Set();
                }
                (node.children || []).forEach(function (child) {
                    set.add(child.levelName);
                    getMaxNesting(child, set);
                });
                return set.size;
            };
            var getMaxExpansion = function (node) {
                var expanded = 0;
                (node.children || []).forEach(function (child) {
                    expanded += getMaxExpansion(child) || 1;
                });
                return expanded;
            };
            var generateNormalizedPath = function (node, parent) {
                return (parent && parent.hierarchy === node.hierarchy ? __spreadArrays((parent.normalizedPath || []).slice(0, -1), [node.name || null]) : __spreadArrays(parent && parent.normalizedPath ? parent.normalizedPath : [], [node.name])).filter(Boolean);
            };
            var generatePath = function (node, parent) {
                return (parent && parent.hierarchy === node.hierarchy ? __spreadArrays((parent.path || []).slice(0, -1), [(node.levelNum === 0 ? node.hierarchy : node.name) || null]) : __spreadArrays(parent && parent.path ? parent.path : [], [node.levelNum === 0 ? node.hierarchy : node.name])).filter(Boolean);
            };
            var toMatrix = function (node, rowIndex, colIndex, maxDepth, maxBreadth, matrix, leafs, parent) {
                if (rowIndex === void 0) {
                    rowIndex = -1;
                }
                if (colIndex === void 0) {
                    colIndex = 0;
                }
                if (maxDepth === void 0) {
                    maxDepth = undefined;
                }
                if (maxBreadth === void 0) {
                    maxBreadth = undefined;
                }
                if (matrix === void 0) {
                    matrix = undefined;
                }
                if (leafs === void 0) {
                    leafs = undefined;
                }
                if (parent === void 0) {
                    parent = undefined;
                }
                var branchDepth = getMaxNesting(node);
                var branchBreadth = getMaxExpansion(node);
                var depth = maxDepth || branchDepth;
                var breadth = maxBreadth || branchBreadth;
                var matrixResult = matrix ? matrix.slice() : [];
                var leafsResult = leafs ? leafs.slice() : new Array(breadth);
                var index = matrixResult.findIndex(function (l) {
                    return l && l.name === node.levelName && l.level === node.levelNum;
                });
                var level = matrixResult[index];
                var row = {
                    name: node.levelName,
                    level: node.levelNum,
                    index: rowIndex,
                    cells: new Array(breadth).fill(null)
                };
                var inject = rowIndex !== -1 && colIndex !== -1;
                var cell = {
                    caption: node.caption,
                    name: node.name,
                    levelName: node.levelName,
                    levelNum: node.levelNum,
                    hasChildren: node.hasChildren,
                    parentName: node.parentName,
                    hierarchy: node.hierarchy,
                    total: (node.total !== undefined ? node.total : false) || parent && parent.children.length <= 1 && parent.total,
                    parent: parent,
                    rowIndex: rowIndex,
                    colIndex: colIndex,
                    depth: 1,
                    breadth: 1,
                    path: node.path || [],
                    normalizedPath: node.normalizedPath || [],
                    children: node.children.filter(function (c) {
                        return c.hierarchy === node.hierarchy;
                    })
                };
                if (inject) {
                    if (level) {
                        level.cells[colIndex] = cell;
                        if (level.index >= rowIndex) {
                            rowIndex = level.index;
                        }
                    } else {
                        if (matrixResult[rowIndex] && matrixResult[rowIndex].cells.length) {
                            for (var idx = rowIndex; idx < matrixResult.length; idx++) {
                                var shiftedRow = matrixResult[idx];
                                shiftedRow.index++;
                            }
                            matrixResult.splice(rowIndex, 0, row);
                            matrixResult[rowIndex].cells[colIndex] = cell;
                        } else {
                            matrixResult[rowIndex] = row;
                            matrixResult[rowIndex].cells[colIndex] = cell;
                        }
                    }
                }
                var collOffset = 0;
                if (node.children && node.children.length) {
                    node.children.forEach(function (child) {
                        var _a = toMatrix(child, rowIndex + 1, colIndex + collOffset, depth, breadth, matrixResult, leafsResult, cell), newMatrix = _a[0], newLeafs = _a[1], childBreadth = _a[3];
                        collOffset += childBreadth || 1;
                        matrixResult = newMatrix.slice();
                        leafsResult = newLeafs.slice();
                    });
                } else if (node.normalizedPath) {
                    leafsResult[colIndex] = {
                        total: cell.total,
                        path: node.normalizedPath
                    };
                }
                cell.depth = branchDepth;
                cell.breadth = branchBreadth;
                return [
                    matrixResult,
                    leafsResult,
                    branchDepth,
                    branchBreadth
                ];
            };
            var withTotal = function (root, parent, index) {
                if (parent === void 0) {
                    parent = null;
                }
                if (index === void 0) {
                    index = 0;
                }
                var hierarchy;
                var alt = __assign(__assign({}, root), {
                    total: true,
                    hasChildren: false,
                    children: []
                });
                for (var childIndex = 0; childIndex < root.children.length; childIndex++) {
                    var child = withTotal(root.children[childIndex], root, childIndex);
                    hierarchy = hierarchy || child.hierarchy;
                    if (child.hierarchy !== hierarchy && parent && !parent.children.some(function (c) {
                            return c.total && c.name === alt.name;
                        }) && !root.total) {
                        alt.children.push(child);
                        root.children.splice(childIndex, 1);
                        childIndex--;
                    }
                }
                if (root.children.filter(function (c) {
                        return !c.total;
                    }).length >= 1 && parent && !parent.children.some(function (c) {
                        return c.total && c.name === alt.name;
                    }) && !root.total) {
                    var childHierarchy = root.children[0].hierarchy;
                    if (root.hierarchy === childHierarchy) {
                        parent.children.splice(index + 1, 0, alt);
                    }
                }
                return root;
            };
            var toTree = function (tuples) {
                var root = { children: [] };
                var map = {};
                var _loop_1 = function (tupleIndex) {
                    var tuple = copy(tuples[tupleIndex]);
                    var key = '';
                    var _loop_2 = function (memberIndex) {
                        var member = tuple.members[memberIndex];
                        var parent_1;
                        if (root.children && root.children.length === 0) {
                            parent_1 = root;
                        } else if (map[key] && !map[key + member.name] && member.levelNum === 0) {
                            parent_1 = map[key];
                        } else if (map[key + member.parentName] && member.levelNum > 0 && !map[key + member.parentName + member.name]) {
                            parent_1 = map[key + member.parentName];
                        } else if (!map[key + member.parentName] && member.levelNum > 0 && !map[key + member.parentName + member.name]) {
                            var parentKey = Object.keys(map).find(function (e) {
                                return e.indexOf(member.hierarchy) === 0 && e.lastIndexOf(key + member.parentName) + (key + member.parentName).length === e.length;
                            });
                            if (parentKey) {
                                parent_1 = map[parentKey];
                            }
                        }
                        if (parent_1) {
                            member.path = generatePath(member, parent_1);
                            member.normalizedPath = generateNormalizedPath(member, parent_1);
                            var intruderIndex = parent_1.children.findIndex(function (c) {
                                return c.hierarchy !== parent_1.hierarchy;
                            });
                            if (intruderIndex !== -1) {
                                parent_1.children.splice(Math.max(intruderIndex, 0), 0, member);
                            } else {
                                parent_1.children.push(member);
                            }
                        }
                        key += member.parentName += member.name;
                        if (!map[key]) {
                            map[key] = member;
                        }
                    };
                    for (var memberIndex = 0; memberIndex < tuple.members.length; memberIndex++) {
                        _loop_2(memberIndex);
                    }
                };
                for (var tupleIndex = 0; tupleIndex < tuples.length; tupleIndex++) {
                    _loop_1(tupleIndex);
                }
                return copy(withTotal(root));
            };
            var toData = function (data, columns, rows, breadth, depth) {
                var result = Array.from(new Array(depth), function () {
                    return {
                        cells: Array.from(new Array(breadth), function () {
                            return null;
                        })
                    };
                });
                var hash = function (names) {
                    return names.join('|');
                };
                var membersNames = function (tuple) {
                    return tuple.members.map(function (m) {
                        return m.name;
                    });
                };
                var columnsIndexes = new Map();
                var rowsIndexes = new Map();
                columns.forEach(function (colMembers, idx) {
                    columnsIndexes.set(hash(colMembers.path), idx);
                });
                rows.forEach(function (rowMembers, idx) {
                    rowsIndexes.set(hash(rowMembers.path), idx);
                });
                data.forEach(function (item) {
                    var colIndex = columnsIndexes.get(hash(membersNames(item.columnTuple)));
                    var rowIndex = rowsIndexes.get(hash(membersNames(item.rowTuple)));
                    if (colIndex !== undefined && rowIndex !== undefined) {
                        if (!result[rowIndex].cells[colIndex]) {
                            result[rowIndex].row = rows[rowIndex].path;
                            result[rowIndex].cells[colIndex] = item;
                        }
                    }
                });
                return result;
            };
            var rotateMatrix = function (matrix, leafs, depth, breadth) {
                var result = new Array(breadth);
                for (var colIndex = 0; colIndex < breadth; colIndex++) {
                    for (var rowIndex = 0; rowIndex < depth; rowIndex++) {
                        if (matrix[rowIndex] && matrix[rowIndex].cells[colIndex]) {
                            var cell = matrix[rowIndex].cells[colIndex];
                            if (!result[colIndex]) {
                                result[colIndex] = { cells: new Array(depth).fill(null) };
                            }
                            result[colIndex].cells[rowIndex] = __assign(__assign({}, cell), {
                                rowSpan: cell.colSpan,
                                colSpan: cell.rowSpan
                            });
                        }
                    }
                }
                return [
                    result,
                    leafs,
                    breadth,
                    depth
                ];
            };
            var toColumns = function (root) {
                var _a = toMatrix(root), matrix = _a[0], leafs = _a[1], depth = _a[2], breadth = _a[3];
                for (var colIndex = 0; colIndex < breadth; colIndex++) {
                    var cell = null;
                    for (var rowIndex = 0; rowIndex < depth; rowIndex++) {
                        if (matrix[rowIndex]) {
                            var next = matrix[rowIndex].cells[colIndex];
                            if (!next && cell) {
                                cell.rowSpan = (cell.rowSpan || 1) + 1;
                            }
                            if (cell) {
                                cell.colSpan = cell.breadth || 1;
                            }
                            if (next) {
                                cell = next;
                            }
                        }
                    }
                }
                return [
                    matrix,
                    leafs,
                    depth,
                    breadth
                ];
            };
            var toRows = function (root) {
                var _a = toMatrix(root), matrix = _a[0], leafs = _a[1], depth = _a[2], breadth = _a[3];
                for (var colIndex = 0; colIndex < breadth; colIndex++) {
                    var cell = null;
                    for (var rowIndex = 0; rowIndex < depth; rowIndex++) {
                        if (matrix[rowIndex]) {
                            var next = matrix[rowIndex].cells[colIndex];
                            if (!next && cell) {
                                cell.rowSpan = (cell.rowSpan || 1) + 1;
                            }
                            if (cell) {
                                cell.colSpan = cell.breadth;
                            }
                            if (next) {
                                cell = next;
                            }
                        }
                    }
                }
                return rotateMatrix(matrix, leafs, depth, breadth);
            };
            function copy(obj) {
                return JSON.parse(JSON.stringify(obj));
            }
            var kpiMeasure = function (name, measure, type) {
                return {
                    hierarchyUniqueName: name,
                    uniqueName: measure,
                    caption: measure,
                    measure: measure,
                    name: measure,
                    type: type,
                    kpi: true
                };
            };
            function buildKPIMeasures(node) {
                var name = node.name;
                return [
                    kpiMeasure(name, node.value, 'value'),
                    kpiMeasure(name, node.goal, 'goal'),
                    kpiMeasure(name, node.status, 'status'),
                    kpiMeasure(name, node.trend, 'trend')
                ];
            }
            var addKPI = function (data) {
                var found;
                var idx = 0;
                for (; idx < data.length; idx++) {
                    if (data[idx].type === 2) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    data.splice(idx + 1, 0, {
                        caption: 'KPIs',
                        defaultHierarchy: '[KPIs]',
                        name: 'KPIs',
                        uniqueName: '[KPIs]'
                    });
                }
            };
            var compareAxisWithField = function (a, b) {
                return String(a.name) === String([b.defaultHierarchy ? b.defaultHierarchy : b.uniqueName]);
            };
            var compareAxes = function (a, b) {
                return String(a.name) === String(b.name);
            };
            exports.HEADERS_ACTION = void 0;
            (function (HEADERS_ACTION) {
                HEADERS_ACTION['toggle'] = 'HEADERS_ACTION_TOGGLE';
                HEADERS_ACTION['expand'] = 'HEADERS_ACTION_EXPAND';
                HEADERS_ACTION['collapse'] = 'HEADERS_ACTION_COLLAPSE';
            }(exports.HEADERS_ACTION || (exports.HEADERS_ACTION = {})));
            var findPath = function (node, matchFn, matched) {
                var result = new Set();
                node.children.forEach(function (child) {
                    var match = matchFn(child);
                    if (matched) {
                        result.add(String(child.path));
                    }
                    findPath(child, matchFn, matched || match).map(function (h) {
                        result.add(h);
                    });
                });
                return Array.from(result.values());
            };
            var headersReducer = function (state, action) {
                switch (action.type) {
                case exports.HEADERS_ACTION.toggle: {
                        var existing = state.find(function (s) {
                            return String(s.name) === String(action.payload);
                        });
                        return headersReducer(state, __assign(__assign({}, action), { type: existing && existing.expand ? exports.HEADERS_ACTION.collapse : exports.HEADERS_ACTION.expand }));
                    }
                case exports.HEADERS_ACTION.expand: {
                        var existing_1 = state.find(function (s) {
                            return String(s.name) === String(action.payload);
                        });
                        if (existing_1 && existing_1.expand === true) {
                            return state;
                        } else if (existing_1 && (existing_1.expand === false || existing_1.expand === undefined)) {
                            return state.map(function (s) {
                                return s === existing_1 ? __assign(__assign({}, existing_1), { expand: true }) : s;
                            });
                        } else {
                            return __spreadArrays(state, [{
                                    name: action.payload,
                                    expand: true
                                }]);
                        }
                    }
                case exports.HEADERS_ACTION.collapse: {
                        var filtered_1 = findPath(action.tree, function (node) {
                            return !node.total && String(node.path) === String(action.payload);
                        });
                        var newState = __spreadArrays(state).filter(function (h) {
                            return !filtered_1.some(function (f) {
                                return f === String(h.name);
                            });
                        }).map(function (h) {
                            return __assign(__assign({}, h), { expand: Boolean(h.expand) });
                        }).map(function (h) {
                            return String(h.name) === String(action.payload) ? action.payload.length > 1 ? undefined : {
                                name: action.payload,
                                expand: false
                            } : h;
                        }).filter(Boolean);
                        return newState;
                    }
                default: {
                        return state;
                    }
                }
            };
            exports.PIVOT_CONFIGURATOR_ACTION = void 0;
            (function (PIVOT_CONFIGURATOR_ACTION) {
                PIVOT_CONFIGURATOR_ACTION['toggleSelection'] = 'PIVOT_CONFIGURATOR_ACTION_TOGGLE_SELECTION';
                PIVOT_CONFIGURATOR_ACTION['addColumnAxis'] = 'PIVOT_CONFIGURATOR_ACTION_ADD_COLUMN_AXIS';
                PIVOT_CONFIGURATOR_ACTION['addColumnAxes'] = 'PIVOT_CONFIGURATOR_ACTION_ADD_COLUMN_AXES';
                PIVOT_CONFIGURATOR_ACTION['removeColumnAxis'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE_COLUMN_AXIS';
                PIVOT_CONFIGURATOR_ACTION['removeColumnAxes'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE_COLUMN_AXES';
                PIVOT_CONFIGURATOR_ACTION['addRowAxis'] = 'PIVOT_CONFIGURATOR_ACTION_ADD_ROW_AXIS';
                PIVOT_CONFIGURATOR_ACTION['addRowAxes'] = 'PIVOT_CONFIGURATOR_ACTION_ADD_ROW_AXES';
                PIVOT_CONFIGURATOR_ACTION['removeRowAxis'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE_ROW_AXIS';
                PIVOT_CONFIGURATOR_ACTION['removeRowAxes'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE_ROW_AXES';
                PIVOT_CONFIGURATOR_ACTION['addMeasureAxis'] = 'PIVOT_CONFIGURATOR_ACTION_ADD_MEASURE_AXIS';
                PIVOT_CONFIGURATOR_ACTION['addMeasureAxes'] = 'PIVOT_CONFIGURATOR_ACTION_ADD_MEASURE_AXES';
                PIVOT_CONFIGURATOR_ACTION['removeMeasureAxis'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE_MEASURE_AXIS';
                PIVOT_CONFIGURATOR_ACTION['removeMeasureAxes'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE_MEASURE_AXES';
                PIVOT_CONFIGURATOR_ACTION['remove'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE';
                PIVOT_CONFIGURATOR_ACTION['setSort'] = 'PIVOT_CONFIGURATOR_ACTION_SET_SORT';
                PIVOT_CONFIGURATOR_ACTION['setFilter'] = 'PIVOT_CONFIGURATOR_ACTION_SET_FILTER';
                PIVOT_CONFIGURATOR_ACTION['addFilter'] = 'PIVOT_CONFIGURATOR_ACTION_ADD_FILTER';
                PIVOT_CONFIGURATOR_ACTION['changeFilter'] = 'PIVOT_CONFIGURATOR_ACTION_CHANGE_FILTER';
                PIVOT_CONFIGURATOR_ACTION['removeFilter'] = 'PIVOT_CONFIGURATOR_ACTION_REMOVE_FILTER';
                PIVOT_CONFIGURATOR_ACTION['setDragItem'] = 'PIVOT_CONFIGURATOR_ACTION_SET_DRAGITEM';
                PIVOT_CONFIGURATOR_ACTION['drop'] = 'PIVOT_CONFIGURATOR_ACTION_DROP';
                PIVOT_CONFIGURATOR_ACTION['setDropZone'] = 'PIVOT_CONFIGURATOR_ACTION_SET_DROP_ZONE';
                PIVOT_CONFIGURATOR_ACTION['setDropTarget'] = 'PIVOT_CONFIGURATOR_ACTION_SET_DROP_TARGET';
                PIVOT_CONFIGURATOR_ACTION['setDropDirection'] = 'PIVOT_CONFIGURATOR_ACTION_SET_DROP_DIRECTION';
            }(exports.PIVOT_CONFIGURATOR_ACTION || (exports.PIVOT_CONFIGURATOR_ACTION = {})));
            var configuratorReducer = function (state, action) {
                var newRows;
                var newColumns;
                var newMeasures;
                var newSort;
                var newFilter;
                var newDragitem;
                var newDropZone;
                var newDropDirection;
                var newDropTarget;
                switch (action.type) {
                case exports.PIVOT_CONFIGURATOR_ACTION.toggleSelection: {
                        if (Array.isArray(action.payload));
                        else {
                            var payload_1 = action.payload;
                            if (payload_1.type === 2 || 'aggregator' in payload_1) {
                                if (state.measureAxes.some(function (s) {
                                        return compareAxisWithField(s, payload_1);
                                    })) {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxis }));
                                } else {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxis }));
                                }
                            } else if (payload_1.type === 'kpi') {
                                var measures = buildKPIMeasures(payload_1);
                                if (measures.every(function (m) {
                                        return state.measureAxes.some(function (s) {
                                            return compareAxisWithField(s, m);
                                        });
                                    })) {
                                    return configuratorReducer(state, __assign(__assign({}, action), {
                                        type: exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxes,
                                        payload: measures
                                    }));
                                } else {
                                    return configuratorReducer(state, __assign(__assign({}, action), {
                                        type: exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxes,
                                        payload: measures.filter(function (m) {
                                            return !state.measureAxes.some(function (s) {
                                                return compareAxisWithField(s, m);
                                            });
                                        })
                                    }));
                                }
                            } else if (action.payload.kpi) {
                                if (state.measureAxes.some(function (s) {
                                        return compareAxisWithField(s, payload_1);
                                    })) {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxis }));
                                } else {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxis }));
                                }
                            } else {
                                if (state.columnAxes.some(function (s) {
                                        return compareAxisWithField(s, payload_1);
                                    })) {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeColumnAxis }));
                                } else if (state.rowAxes.some(function (s) {
                                        return compareAxisWithField(s, payload_1);
                                    })) {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeRowAxis }));
                                } else if (state.columnAxes && state.columnAxes.length && (!state.rowAxes || !state.rowAxes.length)) {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addRowAxis }));
                                } else {
                                    return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addColumnAxis }));
                                }
                            }
                        }
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.addColumnAxis: {
                        newColumns = __spreadArrays(state.columnAxes || [], [{ name: [action.payload.defaultHierarchy || action.payload.uniqueName] }]);
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.addColumnAxes: {
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.removeColumnAxis: {
                        newColumns = __spreadArrays((state.columnAxes || []).filter(function (s) {
                            return !compareAxisWithField(s, action.payload);
                        }));
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.removeColumnAxes: {
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.addRowAxis: {
                        newRows = __spreadArrays(state.rowAxes || [], [{ name: [action.payload.defaultHierarchy || action.payload.uniqueName] }]);
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.addRowAxes: {
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.removeRowAxis: {
                        newRows = __spreadArrays((state.rowAxes || []).filter(function (s) {
                            return !compareAxisWithField(s, action.payload);
                        }));
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.removeRowAxes: {
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxis: {
                        newMeasures = __spreadArrays(state.measureAxes || [], [{ name: [action.payload.defaultHierarchy || action.payload.uniqueName] }]);
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxis: {
                        newMeasures = __spreadArrays((state.measureAxes || []).filter(function (s) {
                            return !compareAxisWithField(s, action.payload);
                        }));
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxes: {
                        newMeasures = __spreadArrays(state.measureAxes || [], (action.payload || []).map(function (p) {
                            return { name: [p.defaultHierarchy || p.uniqueName] };
                        }));
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxes: {
                        newMeasures = __spreadArrays((state.measureAxes || []).filter(function (s) {
                            return !action.payload.some(function (p) {
                                return compareAxisWithField(s, p);
                            });
                        }));
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.remove: {
                        if (state.columnAxes.some(function (s) {
                                return compareAxes(s, action.payload);
                            })) {
                            newColumns = __spreadArrays(state.columnAxes.filter(function (s) {
                                return !compareAxes(s, action.payload);
                            }));
                        }
                        if (state.rowAxes.some(function (s) {
                                return compareAxes(s, action.payload);
                            })) {
                            newRows = __spreadArrays(state.rowAxes.filter(function (s) {
                                return !compareAxes(s, action.payload);
                            }));
                        }
                        if (state.measureAxes.some(function (s) {
                                return compareAxes(s, action.payload);
                            })) {
                            newMeasures = __spreadArrays(state.measureAxes.filter(function (s) {
                                return !compareAxes(s, action.payload);
                            }));
                        }
                        break;
                    }
                case exports.PIVOT_CONFIGURATOR_ACTION.setDragItem:
                    newDragitem = action.payload;
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.setDropZone:
                    newDropZone = action.payload;
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.setDropTarget:
                    newDropTarget = action.payload;
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.setDropDirection:
                    newDropDirection = action.payload;
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.drop:
                    if (state.dragItem && state.dropZone) {
                        var currentColumn = state.columnAxes.find(function (s) {
                            return compareAxes(s, action.payload);
                        });
                        var currentRow = state.rowAxes.find(function (s) {
                            return compareAxes(s, action.payload);
                        });
                        var currentMeasure = state.measureAxes.find(function (s) {
                            return compareAxes(s, action.payload);
                        });
                        var current = void 0;
                        if (currentColumn) {
                            current = currentColumn;
                            newColumns = __spreadArrays(state.columnAxes.filter(function (s) {
                                return !compareAxes(s, action.payload);
                            }));
                        }
                        if (currentRow) {
                            current = currentRow;
                            newRows = __spreadArrays(state.rowAxes.filter(function (s) {
                                return !compareAxes(s, action.payload);
                            }));
                        }
                        if (currentMeasure) {
                            current = currentMeasure;
                            newMeasures = __spreadArrays(state.measureAxes.filter(function (s) {
                                return !compareAxes(s, action.payload);
                            }));
                        }
                        switch (state.dropZone) {
                        case 'columnAxes': {
                                newColumns = newColumns || state.columnAxes.slice();
                                var insertAtIndex = -1;
                                if (state.dropTarget && state.dropDirection) {
                                    var offset = state.dropDirection ? state.dropDirection === 'before' ? 0 : 1 : 0;
                                    insertAtIndex = newColumns.findIndex(function (c) {
                                        return compareAxes(c, state.dropTarget);
                                    }) + offset;
                                }
                                if (insertAtIndex >= 0) {
                                    newColumns.splice(insertAtIndex, 0, current);
                                } else {
                                    newColumns.push(current);
                                }
                                break;
                            }
                        case 'rowAxes': {
                                newRows = newRows || state.rowAxes.slice();
                                var insertAtIndex = -1;
                                if (state.dropTarget && state.dropDirection) {
                                    var offset = state.dropDirection ? state.dropDirection === 'before' ? 0 : 1 : 0;
                                    insertAtIndex = newRows.findIndex(function (c) {
                                        return compareAxes(c, state.dropTarget);
                                    }) + offset;
                                }
                                if (insertAtIndex >= 0) {
                                    newRows.splice(insertAtIndex, 0, current);
                                } else {
                                    newRows.push(current);
                                }
                                break;
                            }
                        case 'measureAxes': {
                                newMeasures = newMeasures || state.measureAxes.slice();
                                var insertAtIndex = -1;
                                if (state.dropTarget && state.dropDirection) {
                                    var offset = state.dropDirection ? state.dropDirection === 'before' ? 0 : 1 : 0;
                                    insertAtIndex = newMeasures.findIndex(function (c) {
                                        return compareAxes(c, state.dropTarget);
                                    }) + offset;
                                }
                                if (insertAtIndex >= 0) {
                                    newMeasures.splice(insertAtIndex, 0, current);
                                } else {
                                    newMeasures.push(current);
                                }
                                break;
                            }
                        }
                    }
                    newDragitem = null;
                    newDropZone = null;
                    newDropTarget = null;
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.setSort:
                    newSort = action.payload;
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.setFilter:
                    if (Array.isArray(action.payload)) {
                        newFilter = action.payload;
                    } else {
                        newFilter = [action.payload];
                    }
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.addFilter:
                    newFilter = (state.filter || []).slice();
                    if (Array.isArray(action.payload)) {
                        newFilter.push.apply(newFilter, action.payload);
                    } else {
                        newFilter.push(action.payload);
                    }
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.changeFilter:
                    newFilter = Array.isArray(action.payload) ? (state.filter || []).map(function (f) {
                        return action.payload.some(function (a) {
                            return a.field === f.field;
                        }) ? action.payload.find(function (a) {
                            return a.field === f.field;
                        }) : f;
                    }) : (state.filter || []).map(function (f) {
                        return f.field === action.payload.field ? action.payload : f;
                    });
                    break;
                case exports.PIVOT_CONFIGURATOR_ACTION.removeFilter:
                    newFilter = (state.filter || []).slice();
                    if (Array.isArray(action.payload)) {
                        newFilter = newFilter.filter(function (f) {
                            return !action.payload.some(function (p) {
                                return p.field === f.field && p.operator === f.operator;
                            });
                        });
                    } else {
                        newFilter = newFilter.filter(function (f) {
                            return !(f.field === action.payload.field && f.operator === action.payload.operator);
                        });
                    }
                    break;
                }
                return {
                    dragItem: newDragitem,
                    dropTarget: newDropTarget,
                    dropDirection: newDropDirection,
                    dropZone: newDropZone,
                    columnAxes: newColumns,
                    rowAxes: newRows,
                    measureAxes: newMeasures,
                    filter: newFilter,
                    sort: newSort
                };
            };
            exports.addKPI = addKPI;
            exports.buildKPIMeasures = buildKPIMeasures;
            exports.compareAxes = compareAxes;
            exports.configuratorReducer = configuratorReducer;
            exports.createAxisDescriptors = createAxisDescriptors;
            exports.createDataState = createDataState;
            exports.createDiscoverBody = createDiscoverBody;
            exports.createRequestBody = createRequestBody;
            exports.discoverCommands = discoverCommands;
            exports.fetchData = fetchData;
            exports.fetchDiscover = fetchDiscover;
            exports.headersReducer = headersReducer;
            exports.parseResponse = parseResponse;
            exports.setFilter = setFilter;
            exports.setSort = setSort;
            exports.toColumns = toColumns;
            exports.toData = toData;
            exports.toRows = toRows;
            exports.toTree = toTree;
            Object.defineProperty(exports, '__esModule', { value: true });
            return exports;
        }({});
    }());
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));
(function (f, define) {
    define('kendo.pivotgrid', [
        'pivotgrid/common',
        'kendo.dom',
        'kendo.data'
    ], f);
}(function () {
    var __meta__ = {
        id: 'pivotgrid',
        name: 'PivotGrid',
        category: 'web',
        description: 'The PivotGrid widget is a data summarization tool.',
        depends: [
            'dom',
            'data',
            'data.xml',
            'sortable'
        ],
        features: [
            {
                id: 'pivotgrid-configurator',
                name: 'Configurator',
                description: 'The PivotConfigurator widget allows the user to select data slices displayed in PivotGrid',
                depends: ['pivot.configurator']
            },
            {
                id: 'pivotgrid-filtering',
                name: 'Filtering',
                description: 'Support for filtering',
                depends: ['pivot.fieldmenu']
            },
            {
                id: 'pivotgrid-excel-export',
                name: 'Excel export',
                description: 'Export pivot grid data as Excel spreadsheet',
                depends: ['ooxml']
            },
            {
                id: 'pivotgrid-pdf-export',
                name: 'PDF export',
                description: 'Export pivot grid data as PDF',
                depends: [
                    'pdf',
                    'drawing'
                ]
            },
            {
                id: 'mobile-scroller',
                name: 'Mobile scroller',
                description: 'Support for kinetic scrolling in mobile device',
                depends: ['mobile.scroller']
            }
        ]
    };
    (function ($, undefined) {
        var kendo = window.kendo, ui = kendo.ui, Class = kendo.Class, Comparer = kendo.data.Comparer, Widget = ui.Widget, DataSource = kendo.data.DataSource, outerWidth = kendo._outerWidth, outerHeight = kendo._outerHeight, common = window.kendo.pivotgrid.common, fetchDiscover = common.fetchDiscover, normalizeFilter = kendo.data.Query.normalizeFilter, normalizeSort = kendo.data.Query.normalizeSort, toString = {}.toString, identity = function (o) {
                return o;
            }, map = $.map, extend = $.extend, isFunction = kendo.isFunction, fetchData = common.fetchData, createDataState = common.createDataState, toColumns = common.toColumns, toRows = common.toRows, toTree = common.toTree, toData = common.toData, headersReducer = common.headersReducer, RESIZE = 'resize', READ = 'read', CHANGE = 'change', ERROR = 'error', REQUESTSTART = 'requestStart', PROGRESS = 'progress', REQUESTEND = 'requestEnd', MEASURES = 'Measures', STATERESET = 'stateReset', AUTO = 'auto', DIV = '<div></div>', NS = '.kendoPivotGrid', ROW_TOTAL_KEY = '__row_total__', DATABINDING = 'dataBinding', DATABOUND = 'dataBound', EXPANDMEMBER = 'expandMember', HEADERTEMPLATE = '<th data-key="#:key#" class="#:headerClass#" #if (colspan) {#colspan="#:colspan#"#}# #if (rowspan) {#rowspan="#:rowspan#"#}#>' + '#if (expandable) {# <span class="k-icon k-i-arrow-chevron-#:iconClass# k-color-inherit" role="presentation"></span>#}#' + '</th>', COLLAPSEMEMBER = 'collapseMember', STATE_EXPANDED = 'k-i-collapse', STATE_COLLAPSED = 'k-i-expand', HEADER_TEMPLATE = '<span>#: data.member.caption || data.member.name #</span>', KPISTATUS_TEMPLATE = '<span class="k-icon k-i-kpi-status-#=data.dataItem.value > 0 ? "open" : data.dataItem.value < 0 ? "deny" : "hold"#" title="#:data.dataItem.value#"></span>', KPITREND_TEMPLATE = '<span class="k-icon k-i-kpi-trend-#=data.dataItem.value > 0 ? "increase" : data.dataItem.value < 0 ? "decrease" : "equal"#" title="#:data.dataItem.value#"></span>', DATACELL_TEMPLATE = '#= data.dataItem ? kendo.htmlEncode(data.dataItem.fmtValue || data.dataItem.value) || "&nbsp;" : "&nbsp;" #', LAYOUT_TABLE = '<table class="k-pivot-layout">' + '<tr>' + '<td>' + '<div class="k-pivot-rowheaders"></div>' + '</td>' + '<td>' + '<div class="k-pivot-table"></div>' + '</td>' + '</tr>' + '</table>';
        var AXIS_ROWS = 'rows';
        var AXIS_COLUMNS = 'columns';
        function normalizeMeasures(measure) {
            var descriptor = typeof measure === 'string' ? [{ name: measure }] : measure;
            var descriptors = toString.call(descriptor) === '[object Array]' ? descriptor : descriptor !== undefined ? [descriptor] : [];
            return map(descriptors, function (d) {
                if (typeof d === 'string') {
                    return { name: d };
                }
                return {
                    name: d.name,
                    type: d.type
                };
            });
        }
        function normalizeMembers(member) {
            var descriptor = typeof member === 'string' ? [{
                    name: [member],
                    expand: false
                }] : member;
            var descriptors = toString.call(descriptor) === '[object Array]' ? descriptor : descriptor !== undefined ? [descriptor] : [];
            return map(descriptors, function (d) {
                if (typeof d === 'string') {
                    return {
                        name: [d],
                        expand: false
                    };
                }
                return {
                    name: toString.call(d.name) === '[object Array]' ? d.name.slice() : [d.name],
                    expand: d.expand
                };
            });
        }
        function normalizeName(name) {
            if (name.indexOf(' ') !== -1) {
                name = '["' + name + '"]';
            }
            return name;
        }
        function accumulateMembers(accumulator, rootTuple, tuple, level) {
            var idx, length;
            var children;
            var member;
            if (!tuple) {
                tuple = rootTuple;
            }
            if (!level) {
                level = 0;
            }
            member = tuple.members[level];
            if (!member || member.measure) {
                return;
            }
            children = member.children;
            length = children.length;
            if (tuple === rootTuple) {
                accumulator[kendo.stringify([member.name])] = !!length;
            } else if (length) {
                accumulator[kendo.stringify(buildPath(tuple, level))] = true;
            }
            if (length) {
                for (idx = 0; idx < length; idx++) {
                    accumulateMembers(accumulator, rootTuple, children[idx], level);
                }
            }
            accumulateMembers(accumulator, rootTuple, tuple, level + 1);
        }
        function descriptorsForAxes(tuples) {
            var result = {};
            if (tuples.length) {
                accumulateMembers(result, tuples[0]);
            }
            var descriptors = [];
            for (var k in result) {
                descriptors.push({
                    name: JSON.parse(k),
                    expand: result[k]
                });
            }
            return descriptors;
        }
        function addMissingPathMembers(members, axis) {
            var tuples = axis.tuples || [];
            var firstTuple = tuples[0];
            if (firstTuple && members.length < firstTuple.members.length) {
                var tupleMembers = firstTuple.members;
                for (var idx = 0; idx < tupleMembers.length; idx++) {
                    if (tupleMembers[idx].measure) {
                        continue;
                    }
                    var found = false;
                    for (var j = 0; j < members.length; j++) {
                        if (getName(members[j]).indexOf(tupleMembers[idx].hierarchy) === 0) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        members.push({
                            name: [tupleMembers[idx].name],
                            expand: false
                        });
                    }
                }
            }
        }
        function tupleToDescriptors(tuple) {
            var result = [];
            var members = tuple.members;
            for (var idx = 0; idx < members.length; idx++) {
                if (members[idx].measure) {
                    continue;
                }
                result.push({
                    name: [members[idx].name],
                    expand: members[idx].children.length > 0
                });
            }
            return result;
        }
        function descriptorsForMembers(axis, members, measures) {
            axis = axis || {};
            addMissingPathMembers(members, axis);
            if (measures.length > 1) {
                members.push({
                    name: MEASURES,
                    measure: true,
                    children: normalizeMembers(measures)
                });
            }
            var tupletoSearch = { members: members };
            if (axis.tuples) {
                var result = findExistingTuple(axis.tuples, tupletoSearch);
                if (result.tuple) {
                    members = tupleToDescriptors(result.tuple);
                }
            }
            return members;
        }
        function createAggregateGetter(m) {
            var measureGetter = kendo.getter(m.field, true);
            return function (aggregatorContext, state) {
                return m.aggregate(measureGetter(aggregatorContext.dataItem), state, aggregatorContext);
            };
        }
        function isNumber(val) {
            return typeof val === 'number' && !isNaN(val);
        }
        function isDate(val) {
            return val && val.getTime;
        }
        function getScollWidth() {
            var scrollbar = 0;
            var div;
            if (document && document.createElement) {
                div = document.createElement('div');
                div.style.cssText = 'overflow:scroll;overflow-x:hidden;zoom:1;clear:both;display:block';
                div.innerHTML = '&nbsp;';
                document.body.appendChild(div);
                scrollbar = div.offsetWidth - div.scrollWidth;
                document.body.removeChild(div);
            }
            return scrollbar;
        }
        var functions = {
            sum: function (value, state) {
                var accumulator = state.accumulator;
                if (!isNumber(accumulator)) {
                    accumulator = value;
                } else if (isNumber(value)) {
                    accumulator += value;
                }
                return accumulator;
            },
            count: function (value, state) {
                return (state.accumulator || 0) + 1;
            },
            average: {
                aggregate: function (value, state) {
                    var accumulator = state.accumulator;
                    if (state.count === undefined) {
                        state.count = 0;
                    }
                    if (!isNumber(accumulator)) {
                        accumulator = value;
                    } else if (isNumber(value)) {
                        accumulator += value;
                    }
                    if (isNumber(value)) {
                        state.count++;
                    }
                    return accumulator;
                },
                result: function (state) {
                    var accumulator = state.accumulator;
                    if (isNumber(accumulator)) {
                        accumulator = accumulator / state.count;
                    }
                    return accumulator;
                }
            },
            max: function (value, state) {
                var accumulator = state.accumulator;
                if (!isNumber(accumulator) && !isDate(accumulator)) {
                    accumulator = value;
                }
                if (accumulator < value && (isNumber(value) || isDate(value))) {
                    accumulator = value;
                }
                return accumulator;
            },
            min: function (value, state) {
                var accumulator = state.accumulator;
                if (!isNumber(accumulator) && !isDate(accumulator)) {
                    accumulator = value;
                }
                if (accumulator > value && (isNumber(value) || isDate(value))) {
                    accumulator = value;
                }
                return accumulator;
            }
        };
        var PivotCubeBuilder = Class.extend({
            init: function (options) {
                this.options = extend({}, this.options, options);
                this.dimensions = this._normalizeDescriptors('field', this.options.dimensions);
                this.measures = this._normalizeDescriptors('name', this.options.measures);
            },
            _normalizeDescriptors: function (keyField, descriptors) {
                descriptors = descriptors || {};
                var fields = {};
                var field;
                if (toString.call(descriptors) === '[object Array]') {
                    for (var idx = 0, length = descriptors.length; idx < length; idx++) {
                        field = descriptors[idx];
                        if (typeof field === 'string') {
                            fields[field] = {};
                        } else if (field[keyField]) {
                            fields[field[keyField]] = field;
                        }
                    }
                    descriptors = fields;
                }
                return descriptors;
            },
            _rootTuples: function (rootNames, measureAggregators) {
                var aggregatorsLength = measureAggregators.length || 1;
                var dimensionsSchema = this.dimensions || [];
                var root, name, parts;
                var measureIdx = 0;
                var idx;
                var rootNamesLength = rootNames.length;
                var result = [];
                var keys = [];
                if (rootNamesLength || measureAggregators.length) {
                    for (measureIdx = 0; measureIdx < aggregatorsLength; measureIdx++) {
                        root = { members: [] };
                        for (idx = 0; idx < rootNamesLength; idx++) {
                            name = rootNames[idx];
                            parts = name.split('&');
                            root.members[root.members.length] = {
                                children: [],
                                caption: (dimensionsSchema[name] || {}).caption || 'All',
                                name: name,
                                levelName: name,
                                levelNum: '0',
                                hasChildren: true,
                                parentName: parts.length > 1 ? parts[0] : undefined,
                                hierarchy: name
                            };
                        }
                        if (aggregatorsLength > 1) {
                            root.members[root.members.length] = {
                                children: [],
                                caption: measureAggregators[measureIdx].caption,
                                name: measureAggregators[measureIdx].descriptor.name,
                                levelName: 'MEASURES',
                                levelNum: '0',
                                hasChildren: false,
                                parentName: undefined,
                                hierarchy: 'MEASURES'
                            };
                        }
                        result[result.length] = root;
                    }
                    keys.push(ROW_TOTAL_KEY);
                }
                return {
                    keys: keys,
                    tuples: result
                };
            },
            _sortMap: function (map, sortDescriptors) {
                var sortedMaps = [];
                var sortTree = [];
                var flattenTree = [];
                var mapItem;
                var key;
                for (key in map) {
                    if (!map[key].directParentName) {
                        sortTree.push($.extend({}, {
                            name: key,
                            parentName: map[key].parentName
                        }));
                    }
                }
                if (!sortTree.length) {
                    for (key in map) {
                        sortTree.push($.extend({}, {
                            name: key,
                            parentName: map[key].parentName
                        }));
                    }
                }
                fillSortTree(sortTree, map);
                for (var i = 0; i < sortDescriptors.length; i++) {
                    sortItemsTree(sortDescriptors[i].field.split('.').pop(), sortTree, Comparer.create({
                        field: 'name',
                        dir: sortDescriptors[i].dir
                    }));
                }
                flattenTree = flatColumns(sortTree);
                for (var j = 0; j < flattenTree.length; j++) {
                    mapItem = map[flattenTree[j].name];
                    mapItem.index = j;
                    sortedMaps[j] = mapItem;
                }
                return sortedMaps;
            },
            _expandedTuples: function (map, expanded, measureAggregators, sortDescriptors) {
                var aggregatorsLength = measureAggregators.length || 1;
                var dimensionsSchema = this.dimensions || [];
                var measureIdx;
                var tuple;
                var key;
                var mapItem;
                var current;
                var currentKeys;
                var accumulator = [];
                var accumulatorKeys = [];
                var memberInfo;
                var expandedNames;
                var parts;
                var name;
                var idx;
                if (sortDescriptors && sortDescriptors.length && !$.isEmptyObject(map)) {
                    map = this._sortMap(map, sortDescriptors);
                }
                for (key in map) {
                    mapItem = map[key];
                    memberInfo = this._findExpandedMember(expanded, mapItem.uniquePath);
                    current = accumulator[memberInfo.index] || [];
                    currentKeys = accumulatorKeys[memberInfo.index] || [];
                    expandedNames = memberInfo.member.names;
                    for (measureIdx = 0; measureIdx < aggregatorsLength; measureIdx++) {
                        tuple = { members: [] };
                        for (idx = 0; idx < expandedNames.length; idx++) {
                            if (idx === memberInfo.member.expandedIdx) {
                                tuple.members[tuple.members.length] = {
                                    children: [],
                                    caption: mapItem.value,
                                    name: mapItem.name,
                                    hasChildren: false,
                                    levelNum: 1,
                                    levelName: mapItem.parentName + mapItem.name,
                                    parentName: mapItem.parentName,
                                    hierarchy: mapItem.parentName + mapItem.name
                                };
                                if (measureIdx === 0) {
                                    currentKeys.push(buildPath(tuple, idx).join(''));
                                }
                            } else {
                                name = expandedNames[idx];
                                parts = name.split('&');
                                tuple.members[tuple.members.length] = {
                                    children: [],
                                    caption: (dimensionsSchema[name] || {}).caption || 'All',
                                    name: name,
                                    levelName: name,
                                    levelNum: '0',
                                    hasChildren: true,
                                    parentName: parts.length > 1 ? parts[0] : undefined,
                                    hierarchy: name
                                };
                            }
                        }
                        if (aggregatorsLength > 1) {
                            tuple.members[tuple.members.length] = {
                                children: [],
                                caption: measureAggregators[measureIdx].caption,
                                name: measureAggregators[measureIdx].descriptor.name,
                                levelName: 'MEASURES',
                                levelNum: '0',
                                hasChildren: true,
                                parentName: undefined,
                                hierarchy: 'MEASURES'
                            };
                        }
                        current[current.length] = tuple;
                    }
                    accumulator[memberInfo.index] = current;
                    accumulatorKeys[memberInfo.index] = currentKeys;
                }
                return {
                    keys: accumulatorKeys,
                    tuples: accumulator
                };
            },
            _findExpandedMember: function (members, parentName) {
                for (var idx = 0; idx < members.length; idx++) {
                    if (members[idx].uniquePath === parentName) {
                        return {
                            member: members[idx],
                            index: idx
                        };
                    }
                }
            },
            _asTuples: function (map, descriptor, measureAggregators, sortDescriptors) {
                measureAggregators = measureAggregators || [];
                var rootInfo = this._rootTuples(descriptor.root, measureAggregators);
                var expandedInfo = this._expandedTuples(map, descriptor.expanded, measureAggregators, sortDescriptors);
                return {
                    keys: [].concat.apply(rootInfo.keys, expandedInfo.keys),
                    tuples: [].concat.apply(rootInfo.tuples, expandedInfo.tuples)
                };
            },
            _measuresInfo: function (measures, rowAxis) {
                var idx = 0;
                var length = measures && measures.length;
                var aggregateNames = [];
                var resultFuncs = {};
                var formats = {};
                var descriptors = this.measures || {};
                var measure;
                var name;
                for (; idx < length; idx++) {
                    name = measures[idx].descriptor.name;
                    measure = descriptors[name] || {};
                    aggregateNames.push(name);
                    if (measure.result) {
                        resultFuncs[name] = measure.result;
                    }
                    if (measure.format) {
                        formats[name] = measure.format;
                    }
                }
                return {
                    names: aggregateNames,
                    formats: formats,
                    resultFuncs: resultFuncs,
                    rowAxis: rowAxis
                };
            },
            _toDataArray: function (map, measuresInfo, rowKeys, columnKeys) {
                var result = [];
                var aggregates;
                var name, i, j, k, n;
                var row, column, columnKey;
                var rowMeasureNamesLength = 1;
                var rowMeasureNames = [];
                var columnMeasureNames;
                var rowLength = rowKeys.length || 1;
                var columnLength = columnKeys.length || 1;
                if (measuresInfo.rowAxis) {
                    rowMeasureNames = measuresInfo.names;
                    rowMeasureNamesLength = rowMeasureNames.length;
                } else {
                    columnMeasureNames = measuresInfo.names;
                }
                for (i = 0; i < rowLength; i++) {
                    row = map[rowKeys[i] || ROW_TOTAL_KEY];
                    for (n = 0; n < rowMeasureNamesLength; n++) {
                        if (measuresInfo.rowAxis) {
                            columnMeasureNames = [rowMeasureNames[n]];
                        }
                        for (j = 0; j < columnLength; j++) {
                            columnKey = columnKeys[j] || ROW_TOTAL_KEY;
                            column = row.items[columnKey];
                            if (columnKey === ROW_TOTAL_KEY) {
                                aggregates = row.aggregates;
                            } else {
                                aggregates = column ? column.aggregates : {};
                            }
                            for (k = 0; k < columnMeasureNames.length; k++) {
                                name = columnMeasureNames[k];
                                this._addData(result, aggregates[name], measuresInfo.formats[name], measuresInfo.resultFuncs[name]);
                            }
                        }
                    }
                }
                return result;
            },
            _addData: function (result, value, format, resultFunc) {
                var fmtValue = '';
                var ordinal;
                if (value) {
                    value = resultFunc ? resultFunc(value) : value.accumulator;
                    fmtValue = format ? kendo.format(format, value) : value;
                }
                ordinal = result.length;
                result[ordinal] = {
                    ordinal: ordinal,
                    value: value || '',
                    fmtValue: fmtValue
                };
            },
            _matchDescriptors: function (dataItem, descriptor, getters) {
                var parts;
                var parentField;
                var expectedValue;
                var names = descriptor.names;
                var idx = descriptor.expandedIdx;
                var value;
                while (idx > 0) {
                    parts = names[--idx].split('&');
                    if (parts.length > 1) {
                        parentField = parts[0];
                        expectedValue = parts[1];
                        value = getters[parentField](dataItem);
                        value = value !== undefined && value !== null ? value.toString() : value;
                        if (value != expectedValue) {
                            return false;
                        }
                    }
                }
                return true;
            },
            _calculateAggregate: function (measureAggregators, aggregatorContext, totalItem) {
                var result = {};
                var state;
                var name;
                for (var measureIdx = 0; measureIdx < measureAggregators.length; measureIdx++) {
                    name = measureAggregators[measureIdx].descriptor.name;
                    state = totalItem.aggregates[name] || {};
                    state.accumulator = measureAggregators[measureIdx].aggregator(aggregatorContext, state);
                    result[name] = state;
                }
                return result;
            },
            _processColumns: function (measureAggregators, descriptors, getters, columns, aggregatorContext, rowTotal, state, updateColumn) {
                var value;
                var descriptor;
                var column;
                var totalItem;
                var key, name, parentName, path;
                var dataItem = aggregatorContext.dataItem;
                var idx = 0;
                for (; idx < descriptors.length; idx++) {
                    descriptor = descriptors[idx];
                    if (!this._matchDescriptors(dataItem, descriptor, getters)) {
                        continue;
                    }
                    path = descriptor.names.slice(0, descriptor.expandedIdx).join('');
                    name = descriptor.names[descriptor.expandedIdx];
                    value = getters[name](dataItem);
                    value = value !== undefined && value !== null ? value.toString() : value;
                    parentName = name;
                    name = name + '&' + value;
                    key = path + name;
                    column = columns[key] || {
                        index: state.columnIndex,
                        parentName: parentName,
                        name: name,
                        directParentName: path.indexOf('&') !== -1 ? path : '',
                        uniquePath: path + parentName,
                        childrenMap: {},
                        value: value
                    };
                    if (path && columns[path] && !columns[path].childrenMap[path + parentName + '&' + value]) {
                        columns[path].childrenMap[path + parentName + '&' + value] = true;
                    }
                    totalItem = rowTotal.items[key] || { aggregates: {} };
                    rowTotal.items[key] = {
                        index: column.index,
                        aggregates: this._calculateAggregate(measureAggregators, aggregatorContext, totalItem)
                    };
                    if (updateColumn) {
                        if (!columns[key]) {
                            state.columnIndex++;
                        }
                        columns[key] = column;
                    }
                }
            },
            _measureAggregators: function (options) {
                var measureDescriptors = options.measures || [];
                var measures = this.measures || {};
                var aggregators = [];
                var descriptor, measure, idx, length;
                var defaultAggregate, aggregate;
                if (measureDescriptors.length) {
                    for (idx = 0, length = measureDescriptors.length; idx < length; idx++) {
                        descriptor = measureDescriptors[idx];
                        measure = measures[descriptor.name];
                        defaultAggregate = null;
                        if (measure) {
                            aggregate = measure.aggregate;
                            if (typeof aggregate === 'string') {
                                defaultAggregate = functions[aggregate.toLowerCase()];
                                if (!defaultAggregate) {
                                    throw new Error('There is no such aggregate function');
                                }
                                measure.aggregate = defaultAggregate.aggregate || defaultAggregate;
                                measure.result = defaultAggregate.result;
                            }
                            aggregators.push({
                                descriptor: descriptor,
                                caption: measure.caption,
                                result: measure.result,
                                aggregator: createAggregateGetter(measure)
                            });
                        }
                    }
                } else {
                    aggregators.push({
                        descriptor: { name: 'default' },
                        caption: 'default',
                        aggregator: function () {
                            return 1;
                        }
                    });
                }
                return aggregators;
            },
            _buildGetters: function (names) {
                var result = {};
                var parts;
                var name;
                for (var idx = 0; idx < names.length; idx++) {
                    name = names[idx];
                    parts = name.split('&');
                    if (parts.length > 1) {
                        result[parts[0]] = kendo.getter(parts[0], true);
                    } else {
                        result[name] = kendo.getter(normalizeName(name), true);
                    }
                }
                return result;
            },
            _parseDescriptors: function (descriptors) {
                var parsedDescriptors = parseDescriptors(descriptors);
                var rootNames = getRootNames(parsedDescriptors.root);
                var expanded = parsedDescriptors.expanded;
                var result = [];
                for (var idx = 0; idx < expanded.length; idx++) {
                    result.push(mapNames(expanded[idx].name, rootNames));
                }
                return {
                    root: rootNames,
                    expanded: result
                };
            },
            _filter: function (data, filter) {
                if (!filter) {
                    return data;
                }
                var expr;
                var idx = 0;
                var filters = filter.filters;
                for (; idx < filters.length; idx++) {
                    expr = filters[idx];
                    if (expr.operator === 'in') {
                        filters[idx] = this._normalizeFilter(expr);
                    }
                }
                return new kendo.data.Query(data).filter(filter).data;
            },
            _normalizeFilter: function (filter) {
                var value = filter.value.split(',');
                var result = [];
                if (!value.length) {
                    return value;
                }
                for (var idx = 0; idx < value.length; idx++) {
                    result.push({
                        field: filter.field,
                        operator: 'eq',
                        value: value[idx]
                    });
                }
                return {
                    logic: 'or',
                    filters: result
                };
            },
            process: function (data, options) {
                data = data || [];
                options = options || {};
                data = this._filter(data, options.filter);
                var measures = options.measures || [];
                var measuresRowAxis = options.measuresAxis === 'rows';
                var columnDescriptors = options.columns || [];
                var rowDescriptors = options.rows || [];
                if (!columnDescriptors.length && rowDescriptors.length && (!measures.length || measures.length && measuresRowAxis)) {
                    columnDescriptors = rowDescriptors;
                    rowDescriptors = [];
                    measuresRowAxis = false;
                }
                if (!columnDescriptors.length && !rowDescriptors.length) {
                    measuresRowAxis = false;
                }
                if (!columnDescriptors.length && measures.length) {
                    columnDescriptors = normalizeMembers(options.measures);
                }
                columnDescriptors = this._parseDescriptors(columnDescriptors);
                rowDescriptors = this._parseDescriptors(rowDescriptors);
                var aggregatedData = {};
                var columns = {};
                var rows = {};
                var rowValue;
                var state = { columnIndex: 0 };
                var measureAggregators = this._measureAggregators(options);
                var columnGetters = this._buildGetters(columnDescriptors.root);
                var rowGetters = this._buildGetters(rowDescriptors.root);
                var processed = false;
                var expandedColumns = columnDescriptors.expanded;
                var expandedRows = rowDescriptors.expanded;
                var dataItem;
                var aggregatorContext;
                var hasExpandedRows = expandedRows.length !== 0;
                var rowIdx, rowDescriptor, rowName, rowTotal;
                var key, path, parentName, value;
                var columnsInfo, rowsInfo;
                var length = data.length;
                var idx = 0;
                if (columnDescriptors.root.length || rowDescriptors.root.length) {
                    processed = true;
                    for (idx = 0; idx < length; idx++) {
                        dataItem = data[idx];
                        aggregatorContext = {
                            dataItem: dataItem,
                            index: idx
                        };
                        rowTotal = aggregatedData[ROW_TOTAL_KEY] || {
                            items: {},
                            aggregates: {}
                        };
                        this._processColumns(measureAggregators, expandedColumns, columnGetters, columns, aggregatorContext, rowTotal, state, !hasExpandedRows);
                        rowTotal.aggregates = this._calculateAggregate(measureAggregators, aggregatorContext, rowTotal);
                        aggregatedData[ROW_TOTAL_KEY] = rowTotal;
                        for (rowIdx = 0; rowIdx < expandedRows.length; rowIdx++) {
                            rowDescriptor = expandedRows[rowIdx];
                            if (!this._matchDescriptors(dataItem, rowDescriptor, rowGetters)) {
                                this._processColumns(measureAggregators, expandedColumns, columnGetters, columns, aggregatorContext, {
                                    items: {},
                                    aggregates: {}
                                }, state, true);
                                continue;
                            }
                            path = rowDescriptor.names.slice(0, rowDescriptor.expandedIdx).join('');
                            rowName = rowDescriptor.names[rowDescriptor.expandedIdx];
                            parentName = rowName;
                            rowValue = rowGetters[rowName](dataItem);
                            rowValue = rowValue !== undefined ? rowValue.toString() : rowValue;
                            rowName = rowName + '&' + rowValue;
                            key = path + rowName;
                            rows[key] = {
                                uniquePath: path + parentName,
                                parentName: parentName,
                                name: rowName,
                                value: rowValue
                            };
                            value = aggregatedData[key] || {
                                items: {},
                                aggregates: {}
                            };
                            this._processColumns(measureAggregators, expandedColumns, columnGetters, columns, aggregatorContext, value, state, true);
                            value.aggregates = this._calculateAggregate(measureAggregators, aggregatorContext, value);
                            aggregatedData[key] = value;
                        }
                    }
                }
                if (processed && length) {
                    if (measureAggregators.length > 1 && (!options.columns || !options.columns.length)) {
                        columnDescriptors = {
                            root: [],
                            expanded: []
                        };
                    }
                    columnsInfo = this._asTuples(columns, columnDescriptors, measuresRowAxis ? [] : measureAggregators, options.sort ? options.sort : []);
                    rowsInfo = this._asTuples(rows, rowDescriptors, measuresRowAxis ? measureAggregators : [], options.sort ? options.sort : []);
                    columns = columnsInfo.tuples;
                    rows = rowsInfo.tuples;
                    aggregatedData = this._toDataArray(aggregatedData, this._measuresInfo(measureAggregators, measuresRowAxis), rowsInfo.keys, columnsInfo.keys);
                } else {
                    aggregatedData = columns = rows = [];
                }
                return {
                    axes: {
                        columns: { tuples: columns },
                        rows: { tuples: rows }
                    },
                    data: aggregatedData
                };
            }
        });
        var PivotTransport = Class.extend({
            init: function (options, transport) {
                this.transport = transport;
                this.options = transport.options || {};
                if (!this.transport.discover) {
                    if (isFunction(options.discover)) {
                        this.discover = options.discover;
                    }
                }
            },
            read: function (options) {
                return this.transport.read(options);
            },
            update: function (options) {
                return this.transport.update(options);
            },
            create: function (options) {
                return this.transport.create(options);
            },
            destroy: function (options) {
                return this.transport.destroy(options);
            },
            discover: function (options) {
                if (this.transport.discover) {
                    return this.transport.discover(options);
                }
                options.success({});
            },
            catalog: function (val) {
                var options = this.options || {};
                if (val === undefined) {
                    return (options.connection || {}).catalog;
                }
                var connection = options.connection || {};
                connection.catalog = val;
                this.options.connection = connection;
                $.extend(this.transport.options, { connection: connection });
            },
            cube: function (val) {
                var options = this.options || {};
                if (val === undefined) {
                    return (options.connection || {}).cube;
                }
                var connection = options.connection || {};
                connection.cube = val;
                this.options.connection = connection;
                extend(true, this.transport.options, { connection: connection });
            }
        });
        var PivotDataSourceV2 = DataSource.extend({
            init: function (options) {
                DataSource.fn.init.call(this, extend(true, {}, {}, options));
                var transportOptions = this.options.transport || {};
                if ((this.options.type || 'xmla').toLowerCase() === 'xmla') {
                    this._online = true;
                    this.transport = new XmlaTransportV2(transportOptions);
                }
                this._columns = normalizeMembers(this.options.columns);
                this._rows = normalizeMembers(this.options.rows);
                var measures = this.options.measures || [];
                if (toString.call(measures) === '[object Object]') {
                    this._measuresAxis = measures.axis || 'columns';
                    measures = measures.values || [];
                }
                this._measures = normalizeMeasures(measures);
            },
            options: {
                serverSorting: true,
                serverPaging: true,
                serverFiltering: true,
                serverGrouping: true,
                serverAggregates: true
            },
            axes: function () {
                return {
                    columns: normalizeAxis(this.columns()),
                    rows: normalizeAxis(this.rows())
                };
            },
            catalog: function (val) {
                if (val === undefined) {
                    return this.transport.catalog();
                }
                this.transport.catalog(val);
                this._mergeState({});
                this.read();
            },
            cube: function (val) {
                if (val === undefined) {
                    return this.transport.cube();
                }
                this.transport.cube(val);
                this._mergeState({});
                this.read();
            },
            measuresAxis: function () {
                return this._measuresAxis || 'columns';
            },
            fetch: function () {
                if (this.options.type.toLowerCase() === 'xmla' && (this._data === undefined || this._data.length === 0)) {
                    this._query();
                }
            },
            read: function (data) {
                var that = this;
                var isPrevented = that.trigger(REQUESTSTART, { type: READ });
                var params = that._params(data);
                if (!isPrevented) {
                    that.trigger(PROGRESS);
                    that.transport.read({
                        data: params,
                        success: function (newDataState) {
                            that._saveState(newDataState);
                            that.trigger(REQUESTEND, {
                                response: newDataState,
                                type: READ
                            });
                            that.trigger(CHANGE);
                            if (that._preventRefresh) {
                                that._preventRefresh = false;
                            }
                        },
                        error: function (err) {
                            that.trigger(ERROR, { error: err });
                        }
                    });
                }
            },
            _params: function (data) {
                var that = this;
                var options = DataSource.fn._params.call(that, data);
                options = extend({
                    connection: that.options.transport.connection,
                    columnAxes: JSON.parse(JSON.stringify(that._columns)),
                    rowAxes: JSON.parse(JSON.stringify(that._rows)),
                    measuresAxis: that.measuresAxis(),
                    measureAxes: that._measures
                }, options);
                if (options.filter) {
                    options.filter = normalizeFilter(options.filter);
                    options.filter = (options.filter || {}).filters;
                }
                if (options.sort) {
                    options.sort = normalizeSort(options.sort);
                }
                return options;
            },
            discover: function (options) {
                var that = this, transport = that.transport;
                if (transport.discover) {
                    return transport.discover(options);
                }
            },
            schemaMeasures: function () {
                var that = this;
                return that.discover({
                    command: 'schemaMeasures',
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube()
                    }
                }, function (response) {
                    return response;
                });
            },
            schemaKPIs: function () {
                var that = this;
                return that.discover({
                    command: 'schemaKPIs',
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube()
                    }
                }, function (response) {
                    return response;
                });
            },
            schemaDimensions: function () {
                var that = this;
                return that.discover({
                    command: 'schemaDimensions',
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube()
                    }
                }, function (response) {
                    return response;
                });
            },
            schemaHierarchies: function (dimensionName) {
                var that = this;
                return that.discover({
                    command: 'schemaHierarchies',
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube(),
                        dimensionUniqueName: dimensionName
                    }
                }, function (response) {
                    return response;
                });
            },
            schemaLevels: function (hierarchyName) {
                var that = this;
                return that.discover({
                    command: 'schemaLevels',
                    restrictions: {
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube(),
                        hierarchyUniqueName: hierarchyName
                    }
                }, function (response) {
                    return response;
                });
            },
            schemaCubes: function () {
                var that = this;
                return that.discover({
                    command: 'schemaCubes',
                    restrictions: { catalogName: that.transport.catalog() }
                }, function (response) {
                    return response;
                });
            },
            schemaCatalogs: function () {
                var that = this;
                return that.discover({ command: 'schemaCatalogs' }, function (response) {
                    return response;
                });
            },
            schemaMembers: function (restrictions) {
                var that = this;
                return that.discover({
                    command: 'schemaMembers',
                    restrictions: extend({
                        catalogName: that.transport.catalog(),
                        cubeName: that.transport.cube()
                    }, restrictions)
                }, function (response) {
                    return response;
                });
            },
            _saveState: function (state) {
                var that = this;
                that._columnTuples = state.columns;
                that._rowTuples = state.rows;
                that._view = state.data;
            },
            columns: function (val) {
                if (val === undefined) {
                    return this._columns;
                }
                this._columns = normalizeMembers(val);
                this.read();
            },
            rows: function (val) {
                if (val === undefined) {
                    return this._rows;
                }
                this._rows = normalizeMembers(val);
                this.read();
            },
            measures: function (val) {
                if (val === undefined) {
                    return this._measures;
                }
                this._measures = normalizeMeasures(val);
                this.read();
            },
            _mergeState: function (options) {
                options = DataSource.fn._mergeState.call(this, options);
                return options;
            },
            _query: function (options) {
                var that = this;
                var params = extend({}, {
                    sort: that.sort(),
                    measuresAxis: that.measuresAxis(),
                    filter: that.filter()
                }, options);
                var state = this._mergeState(params);
                return this.read(state);
            }
        });
        var PivotDataSource = DataSource.extend({
            init: function (options) {
                var cube = ((options || {}).schema || {}).cube;
                var measuresAxis = 'columns';
                var measures;
                var schema = {
                    axes: identity,
                    cubes: identity,
                    catalogs: identity,
                    measures: identity,
                    dimensions: identity,
                    hierarchies: identity,
                    levels: identity,
                    members: identity
                };
                if (cube) {
                    schema = $.extend(schema, this._cubeSchema(cube));
                    this.cubeBuilder = new PivotCubeBuilder(cube);
                }
                DataSource.fn.init.call(this, extend(true, {}, { schema: schema }, options));
                this.transport = new PivotTransport(this.options.transport || {}, this.transport);
                this._columns = normalizeMembers(this.options.columns);
                this._rows = normalizeMembers(this.options.rows);
                measures = this.options.measures || [];
                if (toString.call(measures) === '[object Object]') {
                    measuresAxis = measures.axis || 'columns';
                    measures = measures.values || [];
                }
                this._measures = normalizeMeasures(measures);
                this._measuresAxis = measuresAxis;
                this._skipNormalize = 0;
                this._axes = {};
            },
            _cubeSchema: function (cube) {
                return {
                    dimensions: function () {
                        var result = [];
                        var dimensions = cube.dimensions;
                        for (var key in dimensions) {
                            result.push({
                                name: key,
                                caption: dimensions[key].caption || key,
                                uniqueName: key,
                                defaultHierarchy: key,
                                type: 1
                            });
                        }
                        if (cube.measures) {
                            result.push({
                                name: MEASURES,
                                caption: MEASURES,
                                uniqueName: MEASURES,
                                type: 2
                            });
                        }
                        return result;
                    },
                    hierarchies: function () {
                        return [];
                    },
                    measures: function () {
                        var result = [];
                        var measures = cube.measures;
                        for (var key in measures) {
                            result.push({
                                name: key,
                                caption: key,
                                uniqueName: key,
                                aggregator: key
                            });
                        }
                        return result;
                    },
                    members: $.proxy(function (response, restrictions) {
                        var name = restrictions.levelUniqueName || restrictions.memberUniqueName;
                        var schemaData = this.options.schema.data;
                        var dataGetter = isFunction(schemaData) ? schemaData : kendo.getter(schemaData, true);
                        var data = this.options.data && dataGetter(this.options.data) || this._rawData || [];
                        var result = [];
                        var getter;
                        var value;
                        var idx = 0;
                        var distinct = {};
                        if (name) {
                            name = name.split('.')[0];
                        }
                        if (!restrictions.treeOp) {
                            result.push({
                                caption: cube.dimensions[name].caption || name,
                                childrenCardinality: '1',
                                dimensionUniqueName: name,
                                hierarchyUniqueName: name,
                                levelUniqueName: name,
                                name: name,
                                uniqueName: name
                            });
                            return result;
                        }
                        getter = kendo.getter(normalizeName(name), true);
                        for (; idx < data.length; idx++) {
                            value = getter(data[idx]);
                            if ((value || value === 0) && !distinct[value]) {
                                distinct[value] = true;
                                result.push({
                                    caption: value,
                                    childrenCardinality: '0',
                                    dimensionUniqueName: name,
                                    hierarchyUniqueName: name,
                                    levelUniqueName: name,
                                    name: value,
                                    uniqueName: value
                                });
                            }
                        }
                        return result;
                    }, this)
                };
            },
            options: {
                serverSorting: true,
                serverPaging: true,
                serverFiltering: true,
                serverGrouping: true,
                serverAggregates: true
            },
            catalog: function (val) {
                if (val === undefined) {
                    return this.transport.catalog();
                }
                this.transport.catalog(val);
                this._mergeState({});
                this._axes = {};
                this.data([]);
            },
            cube: function (val) {
                if (val === undefined) {
                    return this.transport.cube();
                }
                this.transport.cube(val);
                this._axes = {};
                this._mergeState({});
                this.data([]);
            },
            axes: function () {
                return this._axes;
            },
            columns: function (val) {
                if (val === undefined) {
                    return this._columns;
                }
                this._skipNormalize += 1;
                this._clearAxesData = true;
                this._columns = normalizeMembers(val);
                this.query({
                    columns: val,
                    rows: this.rowsAxisDescriptors(),
                    measures: this.measures(),
                    sort: this.sort(),
                    filter: this.filter()
                });
            },
            rows: function (val) {
                if (val === undefined) {
                    return this._rows;
                }
                this._skipNormalize += 1;
                this._clearAxesData = true;
                this._rows = normalizeMembers(val);
                this.query({
                    columns: this.columnsAxisDescriptors(),
                    rows: val,
                    measures: this.measures(),
                    sort: this.sort(),
                    filter: this.filter()
                });
            },
            measures: function (val) {
                if (val === undefined) {
                    return this._measures;
                }
                this._skipNormalize += 1;
                this._clearAxesData = true;
                this.query({
                    columns: this.columnsAxisDescriptors(),
                    rows: this.rowsAxisDescriptors(),
                    measures: normalizeMeasures(val),
                    sort: this.sort(),
                    filter: this.filter()
                });
            },
            measuresAxis: function () {
                return this._measuresAxis || 'columns';
            },
            _expandPath: function (path, axis) {
                var origin = axis === 'columns' ? 'columns' : 'rows';
                var other = axis === 'columns' ? 'rows' : 'columns';
                var members = normalizeMembers(path);
                var memberToExpand = getName(members[members.length - 1]);
                this._lastExpanded = origin;
                members = descriptorsForMembers(this.axes()[origin], members, this.measures());
                for (var idx = 0; idx < members.length; idx++) {
                    var memberName = getName(members[idx]);
                    if (memberName === memberToExpand) {
                        if (members[idx].expand) {
                            return;
                        }
                        members[idx].expand = true;
                    } else {
                        members[idx].expand = false;
                    }
                }
                var descriptors = {};
                descriptors[origin] = members;
                descriptors[other] = this._descriptorsForAxis(other);
                this._query(descriptors);
            },
            _descriptorsForAxis: function (axis) {
                var axes = this.axes();
                var descriptors = this[axis]() || [];
                if (axes && axes[axis] && axes[axis].tuples && axes[axis].tuples[0]) {
                    descriptors = descriptorsForAxes(axes[axis].tuples || []);
                }
                return descriptors;
            },
            columnsAxisDescriptors: function () {
                return this._descriptorsForAxis('columns');
            },
            rowsAxisDescriptors: function () {
                return this._descriptorsForAxis('rows');
            },
            _process: function (data, e) {
                this._view = data;
                e = e || {};
                e.items = e.items || this._view;
                this.trigger(CHANGE, e);
            },
            _query: function (options) {
                var that = this;
                if (!options) {
                    this._skipNormalize += 1;
                    this._clearAxesData = true;
                }
                return that.query(extend({}, {
                    page: that.page(),
                    pageSize: that.pageSize(),
                    sort: that.sort(),
                    filter: that.filter(),
                    group: that.group(),
                    aggregate: that.aggregate(),
                    columns: this.columnsAxisDescriptors(),
                    rows: this.rowsAxisDescriptors(),
                    measures: this.measures()
                }, options));
            },
            query: function (options) {
                var state = this._mergeState(options);
                if (this._data.length && this.cubeBuilder) {
                    this._params(state);
                    this._updateLocalData(this._pristineData);
                    return $.Deferred().resolve().promise();
                }
                return this.read(state);
            },
            _mergeState: function (options) {
                options = DataSource.fn._mergeState.call(this, options);
                if (options !== undefined) {
                    this._measures = normalizeMeasures(options.measures);
                    if (options.columns) {
                        options.columns = normalizeMembers(options.columns);
                    } else if (!options.columns) {
                        this._columns = [];
                    }
                    if (options.rows) {
                        options.rows = normalizeMembers(options.rows);
                    } else if (!options.rows) {
                        this._rows = [];
                    }
                }
                return options;
            },
            filter: function (val) {
                if (val === undefined) {
                    return this._filter;
                }
                this._skipNormalize += 1;
                this._clearAxesData = true;
                this._query({
                    filter: val,
                    page: 1
                });
            },
            expandColumn: function (path) {
                this._expandPath(path, 'columns');
            },
            expandRow: function (path) {
                this._expandPath(path, 'rows');
            },
            success: function (data) {
                var originalData;
                if (this.cubeBuilder) {
                    originalData = (this.reader.data(data) || []).slice(0);
                }
                DataSource.fn.success.call(this, data);
                if (originalData) {
                    this._pristineData = originalData;
                }
            },
            _processResult: function (data, axes) {
                if (this.cubeBuilder) {
                    var processedData = this.cubeBuilder.process(data, this._requestData);
                    data = processedData.data;
                    axes = processedData.axes;
                }
                var columnIndexes, rowIndexes;
                var tuples, resultAxis, measures, axisToSkip;
                var columnDescriptors = this.columns();
                var rowDescriptors = this.rows();
                var hasColumnTuples = axes.columns && axes.columns.tuples;
                if (!columnDescriptors.length && rowDescriptors.length && hasColumnTuples && (this._rowMeasures().length || !this.measures().length)) {
                    axes = {
                        columns: {},
                        rows: axes.columns
                    };
                }
                if (!columnDescriptors.length && !rowDescriptors.length && this.measuresAxis() === 'rows' && hasColumnTuples) {
                    axes = {
                        columns: {},
                        rows: axes.columns
                    };
                }
                this._axes = {
                    columns: normalizeAxis(this._axes.columns),
                    rows: normalizeAxis(this._axes.rows)
                };
                axes = {
                    columns: normalizeAxis(axes.columns),
                    rows: normalizeAxis(axes.rows)
                };
                columnIndexes = this._normalizeTuples(axes.columns.tuples, this._axes.columns.tuples, columnDescriptors, this._columnMeasures());
                rowIndexes = this._normalizeTuples(axes.rows.tuples, this._axes.rows.tuples, rowDescriptors, this._rowMeasures());
                if (this._skipNormalize > 0) {
                    this._skipNormalize -= 1;
                }
                if (!this.cubeBuilder) {
                    data = this._normalizeData({
                        columnsLength: axes.columns.tuples.length,
                        rowsLength: axes.rows.tuples.length,
                        columnIndexes: columnIndexes,
                        rowIndexes: rowIndexes,
                        data: data
                    });
                }
                if (this._lastExpanded == 'rows') {
                    tuples = axes.columns.tuples;
                    measures = this._columnMeasures();
                    resultAxis = validateAxis(axes.columns, this._axes.columns, measures);
                    if (resultAxis) {
                        axisToSkip = 'columns';
                        axes.columns = resultAxis;
                        adjustDataByColumn(tuples, resultAxis.tuples, axes.rows.tuples.length, measures, data);
                        if (!this.cubeBuilder) {
                            data = this._normalizeData({
                                columnsLength: membersCount(axes.columns.tuples, measures),
                                rowsLength: axes.rows.tuples.length,
                                data: data
                            });
                        }
                    }
                } else if (this._lastExpanded == 'columns') {
                    tuples = axes.rows.tuples;
                    measures = this._rowMeasures();
                    resultAxis = validateAxis(axes.rows, this._axes.rows, measures);
                    if (resultAxis) {
                        axisToSkip = 'rows';
                        axes.rows = resultAxis;
                        adjustDataByRow(tuples, resultAxis.tuples, axes.columns.tuples.length, measures, data);
                        if (!this.cubeBuilder) {
                            data = this._normalizeData({
                                columnsLength: membersCount(axes.rows.tuples, measures),
                                rowsLength: axes.columns.tuples.length,
                                data: data
                            });
                        }
                    }
                }
                this._lastExpanded = null;
                var result = this._mergeAxes(axes, data, axisToSkip);
                this._axes = result.axes;
                return result.data;
            },
            _readData: function (data) {
                var axes = this.reader.axes(data);
                var newData = this.reader.data(data);
                if (this.cubeBuilder) {
                    this._rawData = newData;
                }
                return this._processResult(newData, axes);
            },
            _createTuple: function (tuple, measure, buildRoot) {
                var members = tuple.members;
                var length = members.length;
                var root = { members: [] };
                var levelName, levelNum;
                var name, parentName;
                var hasChildren;
                var hierarchy;
                var caption;
                var member;
                var idx = 0;
                if (measure) {
                    length -= 1;
                }
                for (; idx < length; idx++) {
                    member = members[idx];
                    levelNum = Number(member.levelNum);
                    name = member.name;
                    parentName = member.parentName;
                    caption = member.caption || name;
                    hasChildren = member.hasChildren;
                    hierarchy = member.hierarchy;
                    levelName = member.levelName;
                    if (buildRoot) {
                        caption = 'All';
                        if (levelNum === 0) {
                            parentName = member.name;
                        } else {
                            levelNum -= 1;
                        }
                        hasChildren = true;
                        name = hierarchy = levelName = parentName;
                    }
                    root.members.push({
                        name: name,
                        children: [],
                        caption: caption,
                        levelName: levelName,
                        levelNum: levelNum.toString(),
                        hasChildren: hasChildren,
                        hierarchy: hierarchy,
                        parentName: !buildRoot ? parentName : ''
                    });
                }
                if (measure) {
                    root.members.push({
                        name: measure.name,
                        children: []
                    });
                }
                return root;
            },
            _hasRoot: function (target, source, descriptors) {
                if (source.length) {
                    return findExistingTuple(source, target).tuple;
                }
                var members = target.members;
                var member;
                var descriptor;
                var isRoot = true;
                var levelNum;
                for (var idx = 0, length = members.length; idx < length; idx++) {
                    member = members[idx];
                    levelNum = Number(member.levelNum) || 0;
                    descriptor = descriptors[idx];
                    if (!(levelNum === 0 || descriptor && member.name === getName(descriptor))) {
                        isRoot = false;
                        break;
                    }
                }
                return isRoot;
            },
            _mergeAxes: function (sourceAxes, data, axisToSkip) {
                var columnMeasures = this._columnMeasures();
                var rowMeasures = this._rowMeasures();
                var axes = this.axes();
                var startIndex, tuples;
                var oldRowsLength = membersCount(axes.rows.tuples, rowMeasures);
                var newRowsLength = sourceAxes.rows.tuples.length;
                var oldColumnsLength = membersCount(axes.columns.tuples, columnMeasures);
                var newColumnsLength = sourceAxes.columns.tuples.length;
                if (axisToSkip == 'columns') {
                    newColumnsLength = oldColumnsLength;
                    tuples = sourceAxes.columns.tuples;
                } else {
                    tuples = parseSource(sourceAxes.columns.tuples, columnMeasures);
                    data = prepareDataOnColumns(tuples, data);
                }
                var mergedColumns = mergeTuples(axes.columns.tuples, tuples, columnMeasures);
                if (axisToSkip == 'rows') {
                    newRowsLength = membersCount(sourceAxes.rows.tuples, rowMeasures);
                    tuples = sourceAxes.rows.tuples;
                } else {
                    tuples = parseSource(sourceAxes.rows.tuples, rowMeasures);
                    data = prepareDataOnRows(tuples, data);
                }
                var mergedRows = mergeTuples(axes.rows.tuples, tuples, rowMeasures);
                axes.columns.tuples = mergedColumns.tuples;
                axes.rows.tuples = mergedRows.tuples;
                if (oldColumnsLength !== membersCount(axes.columns.tuples, columnMeasures)) {
                    startIndex = mergedColumns.index + findDataIndex(mergedColumns.parsedRoot, mergedColumns.memberIndex, columnMeasures);
                    var offset = oldColumnsLength + newColumnsLength;
                    data = this._mergeColumnData(data, startIndex, newRowsLength, newColumnsLength, offset);
                } else if (oldRowsLength !== membersCount(axes.rows.tuples, rowMeasures)) {
                    startIndex = mergedRows.index + findDataIndex(mergedRows.parsedRoot, mergedRows.memberIndex, rowMeasures);
                    data = this._mergeRowData(data, startIndex, newRowsLength, newColumnsLength);
                }
                if (axes.columns.tuples.length === 0 && axes.rows.tuples.length === 0) {
                    data = [];
                }
                return {
                    axes: axes,
                    data: data
                };
            },
            _mergeColumnData: function (newData, columnIndex, rowsLength, columnsLength, offset) {
                var data = this.data().toJSON();
                var rowIndex, index, drop = 0, toAdd;
                var columnMeasures = Math.max(this._columnMeasures().length, 1);
                rowsLength = Math.max(rowsLength, 1);
                if (data.length > 0) {
                    drop = columnMeasures;
                    offset -= columnMeasures;
                }
                for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
                    index = columnIndex + rowIndex * offset;
                    toAdd = newData.splice(0, columnsLength);
                    toAdd.splice(0, drop);
                    [].splice.apply(data, [
                        index,
                        0
                    ].concat(toAdd));
                }
                return data;
            },
            _mergeRowData: function (newData, rowIndex, rowsLength, columnsLength) {
                var data = this.data().toJSON();
                var idx, dataIndex, toAdd;
                var rowMeasures = Math.max(this._rowMeasures().length, 1);
                columnsLength = Math.max(columnsLength, 1);
                if (data.length > 0) {
                    rowsLength -= rowMeasures;
                    newData.splice(0, columnsLength * rowMeasures);
                }
                for (idx = 0; idx < rowsLength; idx++) {
                    toAdd = newData.splice(0, columnsLength);
                    dataIndex = rowIndex * columnsLength + idx * columnsLength;
                    [].splice.apply(data, [
                        dataIndex,
                        0
                    ].concat(toAdd));
                }
                return data;
            },
            _columnMeasures: function () {
                var measures = this.measures();
                var columnMeasures = [];
                if (this.measuresAxis() === 'columns') {
                    if (this.columns().length === 0) {
                        columnMeasures = measures;
                    } else if (measures.length > 1) {
                        columnMeasures = measures;
                    }
                }
                return columnMeasures;
            },
            _rowMeasures: function () {
                var measures = this.measures();
                var rowMeasures = [];
                if (this.measuresAxis() === 'rows') {
                    if (this.rows().length === 0) {
                        rowMeasures = measures;
                    } else if (measures.length > 1) {
                        rowMeasures = measures;
                    }
                }
                return rowMeasures;
            },
            _updateLocalData: function (data, state) {
                if (this.cubeBuilder) {
                    if (state) {
                        this._requestData = state;
                    }
                    data = this._processResult(data);
                }
                this._data = this._observe(data);
                this._ranges = [];
                this._addRange(this._data);
                this._total = this._data.length;
                this._pristineTotal = this._total;
                this._process(this._data);
            },
            data: function (value) {
                var that = this;
                if (value !== undefined) {
                    this._pristineData = value.slice(0);
                    this._updateLocalData(value, {
                        columns: this.columns(),
                        rows: this.rows(),
                        measures: this.measures()
                    });
                } else {
                    return that._data;
                }
            },
            _normalizeTuples: function (tuples, source, descriptors, measures) {
                var length = measures.length || 1;
                var idx = 0;
                var roots = [];
                var indexes = {};
                var measureIdx = 0;
                var tuple, memberIdx, last;
                if (!tuples.length) {
                    return;
                }
                if (this._skipNormalize <= 0 && !this._hasRoot(tuples[0], source, descriptors)) {
                    this._skipNormalize = 0;
                    for (; idx < length; idx++) {
                        roots.push(this._createTuple(tuples[0], measures[idx], true));
                        indexes[idx] = idx;
                    }
                    tuples.splice.apply(tuples, [
                        0,
                        tuples.length
                    ].concat(roots).concat(tuples));
                    idx = length;
                }
                if (measures.length) {
                    last = tuple = tuples[idx];
                    memberIdx = tuple.members.length - 1;
                    while (tuple) {
                        if (measureIdx >= length) {
                            measureIdx = 0;
                        }
                        if (tuple.members[memberIdx].name !== measures[measureIdx].name) {
                            tuples.splice(idx, 0, this._createTuple(tuple, measures[measureIdx]));
                            indexes[idx] = idx;
                        }
                        idx += 1;
                        measureIdx += 1;
                        tuple = tuples[idx];
                        if (length > measureIdx && (!tuple || tupleName(last, memberIdx - 1) !== tupleName(tuple, memberIdx - 1))) {
                            for (; measureIdx < length; measureIdx++) {
                                tuples.splice(idx, 0, this._createTuple(last, measures[measureIdx]));
                                indexes[idx] = idx;
                                idx += 1;
                            }
                            tuple = tuples[idx];
                        }
                        last = tuple;
                    }
                }
                return indexes;
            },
            _addMissingDataItems: function (result, metadata) {
                while (metadata.rowIndexes[parseInt(result.length / metadata.columnsLength, 10)] !== undefined) {
                    for (var idx = 0; idx < metadata.columnsLength; idx++) {
                        result = addEmptyDataItem(result);
                    }
                }
                while (metadata.columnIndexes[result.length % metadata.columnsLength] !== undefined) {
                    result = addEmptyDataItem(result);
                }
                return result;
            },
            _normalizeOrdinals: function (result, dataItem, metadata) {
                var lastOrdinal = metadata.lastOrdinal;
                if (!dataItem) {
                    return addEmptyDataItem(result);
                }
                if (dataItem.ordinal - lastOrdinal > 1) {
                    lastOrdinal += 1;
                    while (lastOrdinal < dataItem.ordinal && result.length < metadata.length) {
                        result = this._addMissingDataItems(addEmptyDataItem(result), metadata);
                        lastOrdinal += 1;
                    }
                }
                dataItem.ordinal = result.length;
                result[result.length] = dataItem;
                return result;
            },
            _normalizeData: function (options) {
                var data = options.data;
                var dataIdx = 0;
                var dataItem;
                var result = [];
                var lastOrdinal;
                var length;
                options.lastOrdinal = 0;
                options.columnIndexes = options.columnIndexes || {};
                options.rowIndexes = options.rowIndexes || {};
                options.columnsLength = options.columnsLength || 1;
                options.rowsLength = options.rowsLength || 1;
                options.length = options.columnsLength * options.rowsLength;
                length = options.length;
                if (data.length === length) {
                    return data;
                }
                while (result.length < length) {
                    dataItem = data[dataIdx++];
                    if (dataItem) {
                        lastOrdinal = dataItem.ordinal;
                    }
                    result = this._normalizeOrdinals(this._addMissingDataItems(result, options), dataItem, options);
                    options.lastOrdinal = lastOrdinal;
                }
                return result;
            },
            discover: function (options, converter) {
                var that = this, transport = that.transport;
                return $.Deferred(function (deferred) {
                    transport.discover(extend({
                        success: function (response) {
                            response = that.reader.parse(response);
                            if (that._handleCustomErrors(response)) {
                                return;
                            }
                            if (converter) {
                                response = converter(response);
                            }
                            deferred.resolve(response);
                        },
                        error: function (response, status, error) {
                            deferred.reject(response);
                            that.error(response, status, error);
                        }
                    }, options));
                }).promise().done(function () {
                    that.trigger('schemaChange');
                });
            },
            schemaMeasures: function () {
                var that = this;
                return that.discover({
                    data: {
                        command: 'schemaMeasures',
                        restrictions: {
                            catalogName: that.transport.catalog(),
                            cubeName: that.transport.cube()
                        }
                    }
                }, function (response) {
                    return that.reader.measures(response);
                });
            },
            schemaKPIs: function () {
                var that = this;
                return that.discover({
                    data: {
                        command: 'schemaKPIs',
                        restrictions: {
                            catalogName: that.transport.catalog(),
                            cubeName: that.transport.cube()
                        }
                    }
                }, function (response) {
                    return that.reader.kpis(response);
                });
            },
            schemaDimensions: function () {
                var that = this;
                return that.discover({
                    data: {
                        command: 'schemaDimensions',
                        restrictions: {
                            catalogName: that.transport.catalog(),
                            cubeName: that.transport.cube()
                        }
                    }
                }, function (response) {
                    return that.reader.dimensions(response);
                });
            },
            schemaHierarchies: function (dimensionName) {
                var that = this;
                return that.discover({
                    data: {
                        command: 'schemaHierarchies',
                        restrictions: {
                            catalogName: that.transport.catalog(),
                            cubeName: that.transport.cube(),
                            dimensionUniqueName: dimensionName
                        }
                    }
                }, function (response) {
                    return that.reader.hierarchies(response);
                });
            },
            schemaLevels: function (hierarchyName) {
                var that = this;
                return that.discover({
                    data: {
                        command: 'schemaLevels',
                        restrictions: {
                            catalogName: that.transport.catalog(),
                            cubeName: that.transport.cube(),
                            hierarchyUniqueName: hierarchyName
                        }
                    }
                }, function (response) {
                    return that.reader.levels(response);
                });
            },
            schemaCubes: function () {
                var that = this;
                return that.discover({
                    data: {
                        command: 'schemaCubes',
                        restrictions: { catalogName: that.transport.catalog() }
                    }
                }, function (response) {
                    return that.reader.cubes(response);
                });
            },
            schemaCatalogs: function () {
                var that = this;
                return that.discover({ data: { command: 'schemaCatalogs' } }, function (response) {
                    return that.reader.catalogs(response);
                });
            },
            schemaMembers: function (restrictions) {
                var that = this;
                var success = function (restrictions) {
                    return function (response) {
                        return that.reader.members(response, restrictions);
                    };
                }(restrictions);
                return that.discover({
                    data: {
                        command: 'schemaMembers',
                        restrictions: extend({
                            catalogName: that.transport.catalog(),
                            cubeName: that.transport.cube()
                        }, restrictions)
                    }
                }, success);
            },
            _params: function (data) {
                if (this._clearAxesData) {
                    this._axes = {};
                    this._data = this._observe([]);
                    this._clearAxesData = false;
                    this.trigger(STATERESET);
                }
                var options = DataSource.fn._params.call(this, data);
                options = extend({
                    measures: this.measures(),
                    measuresAxis: this.measuresAxis(),
                    columns: this.columns(),
                    rows: this.rows()
                }, options);
                if (this.cubeBuilder) {
                    this._requestData = options;
                }
                return options;
            }
        });
        function flatColumns(columns) {
            var result = [];
            for (var idx = 0; idx < columns.length; idx++) {
                result.push(columns[idx]);
                if (columns[idx].children) {
                    result = result.concat(flatColumns(columns[idx].children));
                }
            }
            return result;
        }
        function sortItemsTree(field, items, sortFunction) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].children && items[i].children.length) {
                    sortItemsTree(field, items[i].children, sortFunction);
                }
            }
            if (items[0].parentName != field) {
                return;
            }
            items = items.sort(sortFunction);
        }
        function fillSortTree(items, map) {
            for (var i = 0; i < items.length; i++) {
                var currentItem = map[items[i].name];
                if (!$.isEmptyObject(currentItem.childrenMap)) {
                    items[i].children = [];
                    for (var name in currentItem.childrenMap) {
                        items[i].children.push($.extend({}, {
                            name: name,
                            parentName: map[name].parentName
                        }));
                    }
                    fillSortTree(items[i].children, map);
                }
            }
        }
        function addEmptyDataItem(result) {
            result[result.length] = {
                value: '',
                fmtValue: '',
                ordinal: result.length
            };
            return result;
        }
        function validateAxis(newAxis, axis, measures) {
            if (newAxis.tuples.length < membersCount(axis.tuples, measures)) {
                return axis;
            }
            return;
        }
        function adjustDataByColumn(sourceTuples, targetTuples, rowsLength, measures, data) {
            var columnIdx, rowIdx, dataIdx;
            var columnsLength = sourceTuples.length;
            var targetColumnsLength = membersCount(targetTuples, measures);
            var measuresLength = measures.length || 1;
            for (rowIdx = 0; rowIdx < rowsLength; rowIdx++) {
                for (columnIdx = 0; columnIdx < columnsLength; columnIdx++) {
                    dataIdx = tupleIndex(sourceTuples[columnIdx], targetTuples) * measuresLength;
                    dataIdx += columnIdx % measuresLength;
                    data[rowIdx * columnsLength + columnIdx].ordinal = rowIdx * targetColumnsLength + dataIdx;
                }
            }
        }
        function adjustDataByRow(sourceTuples, targetTuples, columnsLength, measures, data) {
            var columnIdx, rowIdx, dataIdx;
            var rowsLength = sourceTuples.length;
            var measuresLength = measures.length || 1;
            for (rowIdx = 0; rowIdx < rowsLength; rowIdx++) {
                dataIdx = tupleIndex(sourceTuples[rowIdx], targetTuples);
                dataIdx *= measuresLength;
                dataIdx += rowIdx % measuresLength;
                for (columnIdx = 0; columnIdx < columnsLength; columnIdx++) {
                    data[rowIdx * columnsLength + columnIdx].ordinal = dataIdx * columnsLength + columnIdx;
                }
            }
        }
        function tupleIndex(tuple, collection) {
            return findExistingTuple(collection, tuple).index;
        }
        function membersCount(tuples, measures) {
            if (!tuples.length) {
                return 0;
            }
            var queue = tuples.slice();
            var current = queue.shift();
            var result = 1;
            while (current) {
                if (current.members) {
                    [].push.apply(queue, current.members);
                } else if (current.children) {
                    if (!current.measure) {
                        result += current.children.length;
                    }
                    [].push.apply(queue, current.children);
                }
                current = queue.shift();
            }
            if (measures.length) {
                result = result * measures.length;
            }
            return result;
        }
        function normalizeAxis(axis) {
            if (!axis) {
                axis = { tuples: [] };
            }
            if (!axis.tuples) {
                axis.tuples = [];
            }
            return axis;
        }
        function findDataIndex(tuple, memberIndex, measures) {
            if (!tuple) {
                return 0;
            }
            var measuresLength = Math.max(measures.length, 1);
            var tuples = tuple.members.slice(0, memberIndex);
            var current = tuples.shift();
            var counter = measuresLength;
            while (current) {
                if (current.name === MEASURES) {
                    counter += measuresLength - 1;
                } else if (current.children) {
                    [].push.apply(tuples, current.children);
                } else {
                    counter++;
                    [].push.apply(tuples, current.members);
                }
                current = tuples.shift();
            }
            return counter;
        }
        function mergeTuples(target, source, measures) {
            if (!source[0]) {
                return {
                    parsedRoot: null,
                    tuples: target,
                    memberIndex: 0,
                    index: 0
                };
            }
            var result = findExistingTuple(target, source[0]);
            if (!result.tuple) {
                return {
                    parsedRoot: null,
                    tuples: source,
                    memberIndex: 0,
                    index: 0
                };
            }
            var targetMembers = result.tuple.members;
            var sourceMembers = source[0].members;
            var memberIndex = -1;
            if (targetMembers.length !== sourceMembers.length) {
                return {
                    parsedRoot: null,
                    tuples: source,
                    memberIndex: 0,
                    index: 0
                };
            }
            for (var idx = 0, length = targetMembers.length; idx < length; idx++) {
                if (!targetMembers[idx].measure && sourceMembers[idx].children[0]) {
                    if (memberIndex == -1 && sourceMembers[idx].children.length) {
                        memberIndex = idx;
                    }
                    targetMembers[idx].children = sourceMembers[idx].children;
                }
            }
            measures = Math.max(measures.length, 1);
            return {
                parsedRoot: result.tuple,
                index: result.index * measures,
                memberIndex: memberIndex,
                tuples: target
            };
        }
        function equalTuples(first, second) {
            var equal = true;
            var idx, length;
            first = first.members;
            second = second.members;
            for (idx = 0, length = first.length; idx < length; idx++) {
                if (first[idx].measure || second[idx].measure) {
                    continue;
                }
                equal = equal && getName(first[idx]) === getName(second[idx]);
            }
            return equal;
        }
        function findExistingTuple(tuples, toFind) {
            var idx, length, tuple, found, counter = 0;
            var memberIndex, membersLength, member;
            for (idx = 0, length = tuples.length; idx < length; idx++) {
                tuple = tuples[idx];
                if (equalTuples(tuple, toFind)) {
                    return {
                        tuple: tuple,
                        index: counter
                    };
                }
                counter++;
                for (memberIndex = 0, membersLength = tuple.members.length; memberIndex < membersLength; memberIndex++) {
                    member = tuple.members[memberIndex];
                    if (member.measure) {
                        continue;
                    }
                    found = findExistingTuple(member.children, toFind);
                    counter += found.index;
                    if (found.tuple) {
                        return {
                            tuple: found.tuple,
                            index: counter
                        };
                    }
                }
            }
            return { index: counter };
        }
        function addMembers(members, map) {
            var member, i, len, path = '';
            for (i = 0, len = members.length; i < len; i++) {
                member = members[i];
                path += member.name;
                if (!map[path]) {
                    map[path] = member;
                }
            }
        }
        function findParentMember(tuple, map) {
            var members = tuple.members;
            var i, len, member, path = '';
            var parentPath = '';
            var parentMember;
            for (i = 0, len = members.length; i < len; i++) {
                member = members[i];
                if (parentMember) {
                    if (map[path + member.name]) {
                        path += member.name;
                        parentMember = map[path];
                        continue;
                    } else if (map[path + member.parentName]) {
                        return map[path + member.parentName];
                    } else if (map[parentPath + member.parentName]) {
                        return map[parentPath + member.parentName];
                    } else {
                        return map[parentPath];
                    }
                }
                path += member.name;
                parentMember = map[member.parentName];
                if (!parentMember) {
                    parentMember = map[path];
                    if (!parentMember) {
                        return null;
                    }
                }
                if (parentMember) {
                    parentPath += parentMember.name;
                }
            }
            return parentMember;
        }
        function measurePosition(tuple, measures) {
            if (measures.length === 0) {
                return -1;
            }
            var measure = measures[0];
            var members = tuple.members;
            for (var idx = 0, len = members.length; idx < len; idx++) {
                if (members[idx].name == measure.name) {
                    return idx;
                }
            }
        }
        function normalizeTupleMeasures(tuple, index) {
            if (index < 0) {
                return;
            }
            var member = {
                name: MEASURES,
                measure: true,
                children: [$.extend({
                        members: [],
                        dataIndex: tuple.dataIndex
                    }, tuple.members[index])]
            };
            tuple.members.splice(index, 1, member);
            tuple.dataIndex = undefined;
        }
        function parseSource(tuples, measures) {
            if (tuples.length < 1) {
                return [];
            }
            var result = [];
            var map = {};
            var measureIndex = measurePosition(tuples[0], measures);
            for (var i = 0; i < tuples.length; i++) {
                var tuple = tuples[i];
                tuple.dataIndex = i;
                normalizeTupleMeasures(tuple, measureIndex);
                var parentMember = findParentMember(tuple, map);
                if (parentMember) {
                    if (measureIndex < 0 || !parentMember.measure) {
                        parentMember.children.push(tuple);
                    } else {
                        parentMember.children.push(tuple.members[measureIndex].children[0]);
                    }
                } else {
                    result.push(tuple);
                }
                addMembers(tuple.members, map);
            }
            return result;
        }
        function prepareDataOnRows(tuples, data) {
            if (!tuples || !tuples.length) {
                return data;
            }
            var result = [];
            var indices = buildDataIndices(tuples);
            var rowsLength = indices.length;
            var columnsLength = Math.max(data.length / rowsLength, 1);
            var rowIndex, columnIndex, targetIndex, sourceIndex;
            var calcIndex;
            for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
                targetIndex = columnsLength * rowIndex;
                sourceIndex = columnsLength * indices[rowIndex];
                for (columnIndex = 0; columnIndex < columnsLength; columnIndex++) {
                    calcIndex = parseInt(sourceIndex + columnIndex, 10);
                    result[parseInt(targetIndex + columnIndex, 10)] = data[calcIndex] || {
                        value: '',
                        fmtValue: '',
                        ordinal: calcIndex
                    };
                }
            }
            return result;
        }
        function prepareDataOnColumns(tuples, data) {
            if (!tuples || !tuples.length) {
                return data;
            }
            var result = [];
            var indices = buildDataIndices(tuples);
            var columnsLength = indices.length;
            var rowsLength = Math.max(data.length / columnsLength, 1);
            var columnIndex, rowIndex, dataIndex, calcIndex;
            for (rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
                dataIndex = columnsLength * rowIndex;
                for (columnIndex = 0; columnIndex < columnsLength; columnIndex++) {
                    calcIndex = indices[columnIndex] + dataIndex;
                    result[dataIndex + columnIndex] = data[calcIndex] || {
                        value: '',
                        fmtValue: '',
                        ordinal: calcIndex
                    };
                }
            }
            return result;
        }
        function buildDataIndices(tuples) {
            tuples = tuples.slice();
            var result = [];
            var tuple = tuples.shift();
            var idx, length, spliceIndex, children, member;
            while (tuple) {
                if (tuple.dataIndex !== undefined) {
                    result.push(tuple.dataIndex);
                }
                spliceIndex = 0;
                for (idx = 0, length = tuple.members.length; idx < length; idx++) {
                    member = tuple.members[idx];
                    children = member.children;
                    if (member.measure) {
                        [].splice.apply(tuples, [
                            0,
                            0
                        ].concat(children));
                    } else {
                        [].splice.apply(tuples, [
                            spliceIndex,
                            0
                        ].concat(children));
                    }
                    spliceIndex += children.length;
                }
                tuple = tuples.shift();
            }
            return result;
        }
        PivotDataSourceV2.create = function (options) {
            options = options && options.push ? { data: options } : options;
            var dataSource = options || {}, data = dataSource.data;
            dataSource.data = data;
            if (!(dataSource instanceof PivotDataSourceV2) && dataSource instanceof kendo.data.DataSource) {
                throw new Error('Incorrect DataSource type. Only PivotDataSource instances are supported');
            }
            return dataSource instanceof PivotDataSourceV2 ? dataSource : new PivotDataSourceV2(dataSource);
        };
        PivotDataSource.create = function (options) {
            options = options && options.push ? { data: options } : options;
            var dataSource = options || {}, data = dataSource.data;
            dataSource.data = data;
            if (!(dataSource instanceof PivotDataSource) && dataSource instanceof kendo.data.DataSource) {
                throw new Error('Incorrect DataSource type. Only PivotDataSource instances are supported');
            }
            return dataSource instanceof PivotDataSource ? dataSource : new PivotDataSource(dataSource);
        };
        function baseHierarchyPath(memberName) {
            var parts = memberName.split('.');
            if (parts.length > 2) {
                return parts[0] + '.' + parts[1];
            }
            return memberName;
        }
        function expandMemberDescriptor(names, sort) {
            var idx = names.length - 1;
            var name = names[idx];
            var sortDescriptor;
            sortDescriptor = sortDescriptorForMember(sort, name);
            if (sortDescriptor && sortDescriptor.dir) {
                name = 'ORDER(' + name + '.Children,' + sortDescriptor.field + '.CurrentMember.MEMBER_CAPTION,' + sortDescriptor.dir + ')';
            } else {
                name += '.Children';
            }
            names[idx] = name;
            return names;
        }
        function sortDescriptorForMember(sort, member) {
            for (var idx = 0, length = sort.length; idx < length; idx++) {
                if (member.indexOf(sort[idx].field) === 0) {
                    return sort[idx];
                }
            }
            return null;
        }
        function crossJoin(names) {
            var result = 'CROSSJOIN({';
            var r;
            if (names.length > 2) {
                r = names.pop();
                result += crossJoin(names);
            } else {
                result += names.shift();
                r = names.pop();
            }
            result += '},{';
            result += r;
            result += '})';
            return result;
        }
        function crossJoinCommand(members, measures) {
            var tmp = members.slice(0);
            if (measures.length > 1) {
                tmp.push('{' + measureNames(measures).join(',') + '}');
            }
            return crossJoin(tmp);
        }
        function measureNames(measures) {
            var idx = 0;
            var length = measures.length;
            var result = [];
            var measure;
            for (; idx < length; idx++) {
                measure = measures[idx];
                result.push(measure.name !== undefined ? measure.name : measure);
            }
            return result;
        }
        function indexOf(name, items) {
            var idx, length, index = -1;
            for (idx = 0, length = items.length; idx < length; idx++) {
                if (getName(items[idx]) === name) {
                    index = idx;
                    break;
                }
            }
            return index;
        }
        function getName(name) {
            name = name.name || name;
            if (toString.call(name) === '[object Array]') {
                name = name[name.length - 1];
            }
            return name;
        }
        function getRootNames(members) {
            var length = members.length;
            var names = [];
            var idx = 0;
            for (; idx < length; idx++) {
                names.push(members[idx].name[0]);
            }
            return names;
        }
        function mapNames(names, rootNames) {
            var name;
            var rootName;
            var j;
            var idx = 0;
            var length = names.length;
            var rootLength = rootNames.length;
            rootNames = rootNames.slice(0);
            for (; idx < length; idx++) {
                name = names[idx];
                for (j = 0; j < rootLength; j++) {
                    rootName = baseHierarchyPath(rootNames[j]);
                    if (name.indexOf(rootName) !== -1) {
                        rootNames[j] = name;
                        break;
                    }
                }
            }
            return {
                names: rootNames,
                expandedIdx: j,
                uniquePath: rootNames.slice(0, j + 1).join('')
            };
        }
        function parseDescriptors(members) {
            var expanded = [];
            var child = [];
            var root = [];
            var member;
            var j, l;
            var idx = 0;
            var length = members.length;
            var name;
            var hierarchyName;
            var found;
            for (; idx < length; idx++) {
                member = members[idx];
                name = member.name;
                found = false;
                if (toString.call(name) !== '[object Array]') {
                    member.name = name = [name];
                }
                if (name.length > 1) {
                    child.push(member);
                } else {
                    hierarchyName = baseHierarchyPath(name[0]);
                    for (j = 0, l = root.length; j < l; j++) {
                        if (root[j].name[0].indexOf(hierarchyName) === 0) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        root.push(member);
                    }
                    if (member.expand) {
                        expanded.push(member);
                    }
                }
            }
            expanded = expanded.concat(child);
            return {
                root: root,
                expanded: expanded
            };
        }
        function serializeMembers(members, measures, sort) {
            var command = '';
            members = members || [];
            var expanded = parseDescriptors(members);
            var root = expanded.root;
            var rootNames = getRootNames(root);
            var crossJoinCommands = [];
            expanded = expanded.expanded;
            var length = expanded.length;
            var idx = 0;
            var memberName;
            var names = [];
            if (rootNames.length > 1 || measures.length > 1) {
                crossJoinCommands.push(crossJoinCommand(rootNames, measures));
                for (; idx < length; idx++) {
                    memberName = expandMemberDescriptor(expanded[idx].name, sort);
                    names = mapNames(memberName, rootNames).names;
                    crossJoinCommands.push(crossJoinCommand(names, measures));
                }
                command += crossJoinCommands.join(',');
            } else {
                for (; idx < length; idx++) {
                    memberName = expandMemberDescriptor(expanded[idx].name, sort);
                    names.push(memberName[0]);
                }
                command += rootNames.concat(names).join(',');
            }
            return command;
        }
        var filterFunctionFormats = {
            contains: ', InStr({0}.CurrentMember.MEMBER_CAPTION,"{1}") > 0',
            doesnotcontain: ', InStr({0}.CurrentMember.MEMBER_CAPTION,"{1}")',
            startswith: ', Left({0}.CurrentMember.MEMBER_CAPTION,Len("{1}"))="{1}"',
            endswith: ', Right({0}.CurrentMember.MEMBER_CAPTION,Len("{1}"))="{1}"',
            eq: ', {0}.CurrentMember.MEMBER_CAPTION = "{1}"',
            neq: ', {0}.CurrentMember.MEMBER_CAPTION = "{1}"'
        };
        function serializeExpression(expression) {
            var command = '';
            var value = expression.value;
            var field = expression.field;
            var operator = expression.operator;
            if (operator == 'in') {
                command += '{';
                command += value;
                command += '}';
            } else {
                command += operator == 'neq' || operator == 'doesnotcontain' ? '-' : '';
                command += 'Filter(';
                command += field + '.MEMBERS';
                command += kendo.format(filterFunctionFormats[operator], field, value);
                command += ')';
            }
            return command;
        }
        function serializeFilters(filter, cube) {
            var command = '', current;
            var filters = filter.filters;
            var length = filters.length;
            var idx;
            for (idx = length - 1; idx >= 0; idx--) {
                current = 'SELECT (';
                current += serializeExpression(filters[idx]);
                current += ') ON 0';
                if (idx == length - 1) {
                    current += ' FROM [' + cube + ']';
                    command = current;
                } else {
                    command = current + ' FROM ( ' + command + ' )';
                }
            }
            return command;
        }
        function serializeOptions(parentTagName, options, capitalize) {
            var result = '';
            if (options) {
                result += '<' + parentTagName + '>';
                var value;
                for (var key in options) {
                    value = options[key];
                    if (capitalize) {
                        key = key.replace(/([A-Z]+(?=$|[A-Z][a-z])|[A-Z]?[a-z]+)/g, '$1_').toUpperCase().replace(/_$/, '');
                    }
                    result += '<' + key + '>' + value + '</' + key + '>';
                }
                result += '</' + parentTagName + '>';
            } else {
                result += '<' + parentTagName + '/>';
            }
            return result;
        }
        var xmlaDiscoverCommands = {
            schemaCubes: 'MDSCHEMA_CUBES',
            schemaCatalogs: 'DBSCHEMA_CATALOGS',
            schemaMeasures: 'MDSCHEMA_MEASURES',
            schemaDimensions: 'MDSCHEMA_DIMENSIONS',
            schemaHierarchies: 'MDSCHEMA_HIERARCHIES',
            schemaLevels: 'MDSCHEMA_LEVELS',
            schemaMembers: 'MDSCHEMA_MEMBERS',
            schemaKPIs: 'MDSCHEMA_KPIS'
        };
        var convertersMap = {
            read: function (options) {
                var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Execute xmlns="urn:schemas-microsoft-com:xml-analysis"><Command><Statement>';
                command += 'SELECT NON EMPTY {';
                var columns = options.columns || [];
                var rows = options.rows || [];
                var measures = options.measures || [];
                var measuresRowAxis = options.measuresAxis === 'rows';
                var sort = options.sort || [];
                if (!columns.length && rows.length && (!measures.length || measures.length && measuresRowAxis)) {
                    columns = rows;
                    rows = [];
                    measuresRowAxis = false;
                }
                if (!columns.length && !rows.length) {
                    measuresRowAxis = false;
                }
                if (columns.length) {
                    command += serializeMembers(columns, !measuresRowAxis ? measures : [], sort);
                } else if (measures.length && !measuresRowAxis) {
                    command += measureNames(measures).join(',');
                }
                command += '} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON COLUMNS';
                if (rows.length || measuresRowAxis && measures.length > 1) {
                    command += ', NON EMPTY {';
                    if (rows.length) {
                        command += serializeMembers(rows, measuresRowAxis ? measures : [], sort);
                    } else {
                        command += measureNames(measures).join(',');
                    }
                    command += '} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON ROWS';
                }
                if (options.filter) {
                    command += ' FROM ';
                    command += '(';
                    command += serializeFilters(options.filter, options.connection.cube);
                    command += ')';
                } else {
                    command += ' FROM [' + options.connection.cube + ']';
                }
                if (measures.length == 1 && columns.length) {
                    command += ' WHERE (' + measureNames(measures).join(',') + ')';
                }
                command += '</Statement></Command><Properties><PropertyList><Catalog>' + options.connection.catalog + '</Catalog><Format>Multidimensional</Format></PropertyList></Properties></Execute></Body></Envelope>';
                return command.replace(/\&/g, '&amp;');
            },
            discover: function (options) {
                options = options || {};
                var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Discover xmlns="urn:schemas-microsoft-com:xml-analysis">';
                command += '<RequestType>' + (xmlaDiscoverCommands[options.command] || options.command) + '</RequestType>';
                command += '<Restrictions>' + serializeOptions('RestrictionList', options.restrictions, true) + '</Restrictions>';
                if (options.connection && options.connection.catalog) {
                    options.properties = $.extend({}, { Catalog: options.connection.catalog }, options.properties);
                }
                command += '<Properties>' + serializeOptions('PropertyList', options.properties) + '</Properties>';
                command += '</Discover></Body></Envelope>';
                return command;
            }
        };
        var XmlaTransport = kendo.data.RemoteTransport.extend({
            init: function (options) {
                var originalOptions = options;
                options = this.options = extend(true, {}, this.options, options);
                kendo.data.RemoteTransport.call(this, options);
                if (isFunction(originalOptions.discover)) {
                    this.discover = originalOptions.discover;
                } else if (typeof originalOptions.discover === 'string') {
                    this.options.discover = { url: originalOptions.discover };
                } else if (!originalOptions.discover) {
                    this.options.discover = this.options.read;
                }
            },
            setup: function (options, type) {
                options.data = options.data || {};
                $.extend(true, options.data, { connection: this.options.connection });
                return kendo.data.RemoteTransport.fn.setup.call(this, options, type);
            },
            options: {
                read: {
                    dataType: 'text',
                    contentType: 'text/xml',
                    type: 'POST'
                },
                discover: {
                    dataType: 'text',
                    contentType: 'text/xml',
                    type: 'POST'
                },
                parameterMap: function (options, type) {
                    return convertersMap[type](options, type);
                }
            },
            discover: function (options) {
                return $.ajax(this.setup(options, 'discover'));
            }
        });
        var XmlaTransportV2 = Class.extend({
            init: function (options) {
                options = this.options = extend(true, {}, this.options, options);
            },
            setup: function (options) {
                return $.extend(true, options || {}, { connection: this.options.connection });
            },
            read: function (options) {
                var that = this, success, error;
                var fetchOptions = that.setup(options.data, READ);
                success = options.success || $.noop;
                error = options.error || $.noop;
                if (options.parameterMap) {
                    fetchOptions = that.parameterMap(fetchOptions, READ);
                }
                fetchData({ url: that.options.read }, fetchOptions).then(createDataState).then(function (newDataState) {
                    success(newDataState);
                }).catch(function (err) {
                    error(err);
                });
            },
            catalog: function (val) {
                var options = this.options || {};
                if (val === undefined) {
                    return (options.connection || {}).catalog;
                }
                var connection = options.connection || {};
                connection.catalog = val;
                this.options.connection = connection;
                $.extend(this.transport.options, { connection: connection });
            },
            cube: function (val) {
                var options = this.options || {};
                if (val === undefined) {
                    return (options.connection || {}).cube;
                }
                var connection = options.connection || {};
                connection.cube = val;
                this.options.connection = connection;
                extend(true, this.transport.options, { connection: connection });
            },
            discover: function (options) {
                return fetchDiscover({ url: this.options.read }, options);
            }
        });
        function asArray(object) {
            if (object == null) {
                return [];
            }
            var type = toString.call(object);
            if (type !== '[object Array]') {
                return [object];
            }
            return object;
        }
        function translateAxis(axis) {
            var result = { tuples: [] };
            var tuples = asArray(kendo.getter('Tuples.Tuple', true)(axis));
            var captionGetter = kendo.getter('Caption[\'#text\']');
            var unameGetter = kendo.getter('UName[\'#text\']');
            var levelNameGetter = kendo.getter('LName[\'#text\']');
            var levelNumGetter = kendo.getter('LNum[\'#text\']');
            var childrenGetter = kendo.getter('CHILDREN_CARDINALITY[\'#text\']', true);
            var hierarchyGetter = kendo.getter('[\'@Hierarchy\']');
            var parentNameGetter = kendo.getter('PARENT_UNIQUE_NAME[\'#text\']', true);
            for (var idx = 0; idx < tuples.length; idx++) {
                var members = [];
                var member = asArray(tuples[idx].Member);
                for (var memberIdx = 0; memberIdx < member.length; memberIdx++) {
                    members.push({
                        children: [],
                        caption: captionGetter(member[memberIdx]),
                        name: unameGetter(member[memberIdx]),
                        levelName: levelNameGetter(member[memberIdx]),
                        levelNum: levelNumGetter(member[memberIdx]),
                        hasChildren: parseInt(childrenGetter(member[memberIdx]), 10) > 0,
                        parentName: parentNameGetter(member[memberIdx]),
                        hierarchy: hierarchyGetter(member[memberIdx])
                    });
                }
                result.tuples.push({ members: members });
            }
            return result;
        }
        var schemaDataReaderMap = {
            cubes: {
                name: kendo.getter('CUBE_NAME[\'#text\']', true),
                caption: kendo.getter('CUBE_CAPTION[\'#text\']', true),
                description: kendo.getter('DESCRIPTION[\'#text\']', true),
                type: kendo.getter('CUBE_TYPE[\'#text\']', true)
            },
            catalogs: {
                name: kendo.getter('CATALOG_NAME[\'#text\']', true),
                description: kendo.getter('DESCRIPTION[\'#text\']', true)
            },
            measures: {
                name: kendo.getter('MEASURE_NAME[\'#text\']', true),
                caption: kendo.getter('MEASURE_CAPTION[\'#text\']', true),
                uniqueName: kendo.getter('MEASURE_UNIQUE_NAME[\'#text\']', true),
                description: kendo.getter('DESCRIPTION[\'#text\']', true),
                aggregator: kendo.getter('MEASURE_AGGREGATOR[\'#text\']', true),
                groupName: kendo.getter('MEASUREGROUP_NAME[\'#text\']', true),
                displayFolder: kendo.getter('MEASURE_DISPLAY_FOLDER[\'#text\']', true),
                defaultFormat: kendo.getter('DEFAULT_FORMAT_STRING[\'#text\']', true)
            },
            kpis: {
                name: kendo.getter('KPI_NAME[\'#text\']', true),
                caption: kendo.getter('KPI_CAPTION[\'#text\']', true),
                value: kendo.getter('KPI_VALUE[\'#text\']', true),
                goal: kendo.getter('KPI_GOAL[\'#text\']', true),
                status: kendo.getter('KPI_STATUS[\'#text\']', true),
                trend: kendo.getter('KPI_TREND[\'#text\']', true),
                statusGraphic: kendo.getter('KPI_STATUS_GRAPHIC[\'#text\']', true),
                trendGraphic: kendo.getter('KPI_TREND_GRAPHIC[\'#text\']', true),
                description: kendo.getter('KPI_DESCRIPTION[\'#text\']', true),
                groupName: kendo.getter('MEASUREGROUP_NAME[\'#text\']', true)
            },
            dimensions: {
                name: kendo.getter('DIMENSION_NAME[\'#text\']', true),
                caption: kendo.getter('DIMENSION_CAPTION[\'#text\']', true),
                description: kendo.getter('DESCRIPTION[\'#text\']', true),
                uniqueName: kendo.getter('DIMENSION_UNIQUE_NAME[\'#text\']', true),
                defaultHierarchy: kendo.getter('DEFAULT_HIERARCHY[\'#text\']', true),
                type: kendo.getter('DIMENSION_TYPE[\'#text\']', true)
            },
            hierarchies: {
                name: kendo.getter('HIERARCHY_NAME[\'#text\']', true),
                caption: kendo.getter('HIERARCHY_CAPTION[\'#text\']', true),
                description: kendo.getter('DESCRIPTION[\'#text\']', true),
                uniqueName: kendo.getter('HIERARCHY_UNIQUE_NAME[\'#text\']', true),
                dimensionUniqueName: kendo.getter('DIMENSION_UNIQUE_NAME[\'#text\']', true),
                displayFolder: kendo.getter('HIERARCHY_DISPLAY_FOLDER[\'#text\']', true),
                origin: kendo.getter('HIERARCHY_ORIGIN[\'#text\']', true),
                defaultMember: kendo.getter('DEFAULT_MEMBER[\'#text\']', true)
            },
            levels: {
                name: kendo.getter('LEVEL_NAME[\'#text\']', true),
                caption: kendo.getter('LEVEL_CAPTION[\'#text\']', true),
                description: kendo.getter('DESCRIPTION[\'#text\']', true),
                uniqueName: kendo.getter('LEVEL_UNIQUE_NAME[\'#text\']', true),
                dimensionUniqueName: kendo.getter('DIMENSION_UNIQUE_NAME[\'#text\']', true),
                displayFolder: kendo.getter('LEVEL_DISPLAY_FOLDER[\'#text\']', true),
                orderingProperty: kendo.getter('LEVEL_ORDERING_PROPERTY[\'#text\']', true),
                origin: kendo.getter('LEVEL_ORIGIN[\'#text\']', true),
                hierarchyUniqueName: kendo.getter('HIERARCHY_UNIQUE_NAME[\'#text\']', true)
            },
            members: {
                name: kendo.getter('MEMBER_NAME[\'#text\']', true),
                caption: kendo.getter('MEMBER_CAPTION[\'#text\']', true),
                uniqueName: kendo.getter('MEMBER_UNIQUE_NAME[\'#text\']', true),
                dimensionUniqueName: kendo.getter('DIMENSION_UNIQUE_NAME[\'#text\']', true),
                hierarchyUniqueName: kendo.getter('HIERARCHY_UNIQUE_NAME[\'#text\']', true),
                levelUniqueName: kendo.getter('LEVEL_UNIQUE_NAME[\'#text\']', true),
                childrenCardinality: kendo.getter('CHILDREN_CARDINALITY[\'#text\']', true)
            }
        };
        var xmlaReaderMethods = [
            'axes',
            'catalogs',
            'cubes',
            'dimensions',
            'hierarchies',
            'levels',
            'measures'
        ];
        var XmlaDataReader = kendo.data.XmlDataReader.extend({
            init: function (options) {
                kendo.data.XmlDataReader.call(this, options);
                this._extend(options);
            },
            _extend: function (options) {
                var idx = 0;
                var length = xmlaReaderMethods.length;
                var methodName;
                var option;
                for (; idx < length; idx++) {
                    methodName = xmlaReaderMethods[idx];
                    option = options[methodName];
                    if (option && option !== identity) {
                        this[methodName] = option;
                    }
                }
            },
            parse: function (xml) {
                var result = kendo.data.XmlDataReader.fn.parse(xml.replace(/<(\/?)(\w|-)+:/g, '<$1'));
                return kendo.getter('[\'Envelope\'][\'Body\']', true)(result);
            },
            errors: function (root) {
                var fault = kendo.getter('[\'Fault\']', true)(root);
                if (fault) {
                    return [{
                            faultstring: kendo.getter('faultstring[\'#text\']', true)(fault),
                            faultcode: kendo.getter('faultcode[\'#text\']', true)(fault)
                        }];
                }
                return null;
            },
            axes: function (root) {
                root = kendo.getter('ExecuteResponse["return"].root', true)(root);
                var axes = asArray(kendo.getter('Axes.Axis', true)(root));
                var axis;
                var result = {
                    columns: {},
                    rows: {}
                };
                for (var idx = 0; idx < axes.length; idx++) {
                    axis = axes[idx];
                    if (axis['@name'].toLowerCase() !== 'sliceraxis') {
                        if (!result.columns.tuples) {
                            result.columns = translateAxis(axis);
                        } else {
                            result.rows = translateAxis(axis);
                        }
                    }
                }
                return result;
            },
            data: function (root) {
                root = kendo.getter('ExecuteResponse["return"].root', true)(root);
                var cells = asArray(kendo.getter('CellData.Cell', true)(root));
                var result = [];
                var ordinalGetter = kendo.getter('[\'@CellOrdinal\']');
                var valueGetter = kendo.getter('Value[\'#text\']');
                var fmtValueGetter = kendo.getter('FmtValue[\'#text\']');
                for (var idx = 0; idx < cells.length; idx++) {
                    result.push({
                        value: valueGetter(cells[idx]),
                        fmtValue: fmtValueGetter(cells[idx]),
                        ordinal: parseInt(ordinalGetter(cells[idx]), 10)
                    });
                }
                return result;
            },
            _mapSchema: function (root, getters) {
                root = kendo.getter('DiscoverResponse["return"].root', true)(root);
                var rows = asArray(kendo.getter('row', true)(root));
                var result = [];
                for (var idx = 0; idx < rows.length; idx++) {
                    var obj = {};
                    for (var key in getters) {
                        obj[key] = getters[key](rows[idx]);
                    }
                    result.push(obj);
                }
                return result;
            },
            measures: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.measures);
            },
            kpis: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.kpis);
            },
            hierarchies: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.hierarchies);
            },
            levels: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.levels);
            },
            dimensions: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.dimensions);
            },
            cubes: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.cubes);
            },
            catalogs: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.catalogs);
            },
            members: function (root) {
                return this._mapSchema(root, schemaDataReaderMap.members);
            }
        });
        extend(true, kendo.data, {
            PivotDataSource: PivotDataSource,
            PivotDataSourceV2: PivotDataSourceV2,
            XmlaTransport: XmlaTransport,
            XmlaDataReader: XmlaDataReader,
            PivotCubeBuilder: PivotCubeBuilder,
            transports: { xmla: XmlaTransport },
            readers: { xmla: XmlaDataReader }
        });
        var sortExpr = function (expressions, name) {
            if (!expressions) {
                return null;
            }
            for (var idx = 0, length = expressions.length; idx < length; idx++) {
                if (expressions[idx].field === name) {
                    return expressions[idx];
                }
            }
            return null;
        };
        var removeExpr = function (expressions, name) {
            var result = [];
            for (var idx = 0, length = expressions.length; idx < length; idx++) {
                if (expressions[idx].field !== name) {
                    result.push(expressions[idx]);
                }
            }
            return result;
        };
        kendo.ui.PivotSettingTarget = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that.element.addClass('k-pivot-setting');
                that.dataSource = kendo.data.PivotDataSource.create(options.dataSource);
                that._refreshHandler = $.proxy(that.refresh, that);
                that.dataSource.first(CHANGE, that._refreshHandler);
                if (!options.template) {
                    var actions = '';
                    if (that.options.enabled) {
                        actions = '<span class="k-setting-delete k-chip-action"><span class="k-icon k-i-close"></span></span>';
                    }
                    that.options.template = '' + '<span class="k-chip k-chip-md k-rounded-full k-chip-solid k-chip-solid-base" data-' + kendo.ns + 'name="${data.name || data}">' + '<span class="k-chip-content">' + '<span class="k-chip-text">${data.name || data}</span>' + '</span>' + '<span class="k-chip-actions">' + actions + '</span>' + '</span>';
                }
                that.template = kendo.template(that.options.template);
                that.emptyTemplate = kendo.template(that.options.emptyTemplate);
                that._sortable();
                that.element.on('click' + NS, '.k-chip, .k-button', function (e) {
                    var target = $(e.target);
                    var action = target.closest('.k-chip-action');
                    var name = target.closest('[' + kendo.attr('name') + ']').attr(kendo.attr('name'));
                    if (!name) {
                        return;
                    }
                    if (action.hasClass('k-setting-delete')) {
                        that.remove(name);
                        return;
                    }
                    if (target.closest('.k-chip-actions').length > 0) {
                        return;
                    }
                    if (that.options.sortable) {
                        var sortDirection = $(e.currentTarget).find('.k-i-sort-asc-sm').length ? 'desc' : 'asc';
                        that.sort({
                            field: name,
                            dir: sortDirection
                        });
                    }
                });
                if (options.filterable || options.sortable) {
                    that.fieldMenu = new ui.PivotFieldMenu(that.element, {
                        messages: that.options.messages.fieldMenu,
                        filter: '.k-setting-fieldmenu',
                        filterable: options.filterable,
                        sortable: options.sortable,
                        dataSource: that.dataSource
                    });
                }
                that.refresh();
            },
            options: {
                name: 'PivotSettingTarget',
                template: null,
                filterable: false,
                sortable: false,
                emptyTemplate: '<div class=\'k-empty\'>${data}</div>',
                setting: 'columns',
                enabled: true,
                messages: { empty: 'Drop Fields Here' }
            },
            setDataSource: function (dataSource) {
                this.dataSource.unbind(CHANGE, this._refreshHandler);
                this.dataSource = this.options.dataSource = dataSource;
                if (this.fieldMenu) {
                    this.fieldMenu.setDataSource(dataSource);
                }
                dataSource.first(CHANGE, this._refreshHandler);
                this.refresh();
            },
            _sortable: function () {
                var that = this;
                if (that.options.enabled) {
                    this.sortable = this.element.kendoSortable({
                        connectWith: this.options.connectWith,
                        hint: that.options.hint,
                        filter: '>*:not(.k-empty)',
                        cursor: 'move',
                        start: function (e) {
                            e.item.trigger('focus').trigger('blur');
                        },
                        change: function (e) {
                            var name = e.item.attr(kendo.attr('name'));
                            if (e.action == 'receive') {
                                that.add(name);
                            } else if (e.action == 'remove') {
                                that.remove(name);
                            } else if (e.action == 'sort') {
                                that.move(name, e.newIndex);
                            }
                        }
                    }).data('kendoSortable');
                }
            },
            _isKPI: function (data) {
                return data.type === 'kpi' || data.measure;
            },
            validate: function (data) {
                var isMeasure = data.type == 2 || 'aggregator' in data || this._isKPI(data);
                if (isMeasure) {
                    return this.options.setting === 'measures';
                }
                if (this.options.setting === 'measures') {
                    return isMeasure;
                }
                var items = this.dataSource[this.options.setting]();
                var name = data.defaultHierarchy || data.uniqueName;
                if (indexOf(name, items) > -1) {
                    return false;
                }
                items = this.dataSource[this.options.setting === 'columns' ? 'rows' : 'columns']();
                if (indexOf(name, items) > -1) {
                    return false;
                }
                return true;
            },
            add: function (name) {
                var items = this.dataSource[this.options.setting]();
                var i, l;
                name = Array.isArray(name) ? name.slice(0) : [name];
                for (i = 0, l = name.length; i < l; i++) {
                    if (indexOf(name[i], items) !== -1) {
                        name.splice(i, 1);
                        i -= 1;
                        l -= 1;
                    }
                }
                if (name.length) {
                    items = items.concat(name);
                    this.dataSource[this.options.setting](items);
                }
            },
            move: function (name, index) {
                var items = this.dataSource[this.options.setting]();
                var idx = indexOf(name, items);
                if (idx > -1) {
                    name = items.splice(idx, 1)[0];
                    items.splice(index, 0, name);
                    this.dataSource[this.options.setting](items);
                }
            },
            remove: function (name) {
                var items = this.dataSource[this.options.setting]();
                var idx = indexOf(name, items);
                var sortExpressions = this.dataSource.sort();
                var filter = this.dataSource.filter();
                if (idx > -1) {
                    if (filter) {
                        filter.filters = removeExpr(filter.filters, name);
                        this.dataSource._filter.filters = filter.filters;
                        if (!filter.filters.length) {
                            this.dataSource._filter = null;
                        }
                    }
                    if (sortExpressions) {
                        sortExpressions = removeExpr(sortExpressions, name);
                        this.dataSource._sort = sortExpressions;
                    }
                    items.splice(idx, 1);
                    this.dataSource[this.options.setting](items);
                }
            },
            sort: function (expr) {
                var sortable = this.options.sortable;
                var allowUnsort = sortable === true || sortable.allowUnsort;
                var skipExpr = allowUnsort && expr.dir === 'asc';
                var expressions = this.dataSource.sort() || [];
                var result = removeExpr(expressions, expr.field);
                if (skipExpr && expressions.length !== result.length) {
                    expr = null;
                }
                if (expr) {
                    result.push(expr);
                }
                this.dataSource.sort(result);
            },
            refresh: function () {
                var html = '';
                var items = this.dataSource[this.options.setting]();
                var length = items.length;
                var idx = 0;
                var item;
                if (length) {
                    for (; idx < length; idx++) {
                        item = items[idx];
                        item = item.name === undefined ? { name: item } : item;
                        html += this.template(extend({ sortIcon: this._sortIcon(item.name) }, item));
                    }
                } else {
                    html = this.emptyTemplate(this.options.messages.empty);
                }
                this.element.html(html);
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                this.dataSource.unbind(CHANGE, this._refreshHandler);
                this.element.off(NS);
                if (this.sortable) {
                    this.sortable.destroy();
                }
                if (this.fieldMenu) {
                    this.fieldMenu.destroy();
                }
                this.element = null;
                this._refreshHandler = null;
            },
            _sortIcon: function (name) {
                var expressions = this.dataSource.sort();
                var expr = sortExpr(expressions, getName(name));
                var icon = '';
                if (expr) {
                    icon = 'k-i-sort-' + expr.dir;
                }
                return icon;
            }
        });
        kendo.ui.PivotSettingTargetV2 = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that.dataSource = kendo.data.PivotDataSourceV2.create(options.dataSource);
                that._refreshHandler = $.proxy(that.refresh, that);
                that.dataSource.first(CHANGE, that._refreshHandler);
                that.template = kendo.template(that.options.template);
                that._sortable();
                that.element.on('click' + NS, '.k-i-close-circle', function (e) {
                    var target = $(e.target);
                    var parent = target.closest('.k-chip');
                    var name = parent.find('.k-chip-label').text();
                    if (!name) {
                        return;
                    }
                    that.remove(name);
                    parent.remove();
                    that.trigger('remove', { name: name });
                });
                if (options.filterable || options.sortable) {
                    that.fieldMenu = new ui.PivotFieldMenuV2(that.element, {
                        messages: that.options.messages.fieldMenu,
                        filterable: options.filterable,
                        filter: '.k-i-more-vertical',
                        sortable: options.sortable,
                        dataSource: that.dataSource
                    });
                }
                that.refresh();
            },
            events: ['remove'],
            options: {
                name: 'PivotSettingTargetV2',
                template: null,
                filterable: false,
                sortable: false,
                setting: 'columns',
                enabled: true,
                messages: { empty: 'Drop Fields Here' }
            },
            setDataSource: function (dataSource) {
                this.dataSource.unbind(CHANGE, this._refreshHandler);
                this.dataSource = this.options.dataSource = dataSource;
                if (this.fieldMenu) {
                    this.fieldMenu.setDataSource(dataSource);
                }
                dataSource.first(CHANGE, this._refreshHandler);
                this.refresh();
            },
            _applyState: function () {
                if (this._sortState !== undefined) {
                    this.dataSource._sort = this._sortState;
                    this._sortState = undefined;
                }
                if (this._stateFilter !== undefined) {
                    this.dataSource._filter = this._stateFilter;
                    this._stateFilter = undefined;
                }
                this.dataSource['_' + this.options.setting] = this.options.setting === 'measures' ? normalizeMeasures(this._savedState) : normalizeMembers(this._savedState);
            },
            _cancelChanges: function () {
                this._sortState = undefined;
                this._stateFilter = undefined;
                this._savedState = kendo.deepExtend([], this._initialState);
                this._redraw();
            },
            _state: function (newState, modifyInit) {
                var that = this;
                if (!newState) {
                    return that._savedState || [];
                } else {
                    if (!that._savedState || modifyInit) {
                        that._initialState = kendo.deepExtend([], newState);
                    }
                    that._savedState = kendo.deepExtend([], newState);
                }
            },
            _sortable: function () {
                var that = this;
                this.sortable = this.element.kendoSortable({
                    connectWith: this.options.connectWith,
                    hint: that.options.hint,
                    filter: '>*:not(.k-empty)',
                    cursor: 'move',
                    start: function (e) {
                        e.item.focus().blur();
                    },
                    change: function (e) {
                        var name = e.item.find('.k-chip-label').text();
                        if (e.action == 'receive') {
                            that.add(name);
                        } else if (e.action == 'remove') {
                            that.remove(name);
                        } else if (e.action == 'sort') {
                            that.move(name, e.newIndex);
                        }
                    }
                }).data('kendoSortable');
            },
            add: function (name) {
                var items = this._state();
                var i, l;
                name = $.isArray(name) ? name.slice(0) : [name];
                for (i = 0, l = name.length; i < l; i++) {
                    if (indexOf(name[i], items) !== -1) {
                        name.splice(i, 1);
                        i -= 1;
                        l -= 1;
                    }
                }
                if (name.length) {
                    items = items.concat(name);
                    this._state(items);
                    this._redraw();
                }
            },
            move: function (name, index) {
                var items = this._state();
                var idx = indexOf(name, items);
                if (idx > -1) {
                    name = items.splice(idx, 1)[0];
                    items.splice(index, 0, name);
                    this._state(items);
                    this._redraw();
                }
            },
            remove: function (name) {
                var items = this._state();
                var idx = indexOf(name, items);
                var sortExpressions = this.dataSource.sort();
                var filter = this.dataSource.filter();
                if (idx > -1) {
                    if (filter) {
                        filter.filters = removeExpr(filter.filters, name);
                        this._savedFilter = this.dataSource._filter;
                        this._savedFilter.filters = filter.filters;
                        if (!filter.filters.length) {
                            this._savedFilter = null;
                        }
                    }
                    if (sortExpressions) {
                        sortExpressions = removeExpr(sortExpressions, name);
                        this._sortState = sortExpressions;
                    }
                    items.splice(idx, 1);
                    this._state(items);
                    this._redraw();
                }
            },
            _emptyState: function (enable) {
                var that = this;
                if (enable) {
                    that.element.html(this.options.messages.empty).addClass('k-settings-description').removeClass('k-chip-list');
                } else {
                    that.element.removeClass('k-settings-description').addClass('k-chip-list');
                }
            },
            _redraw: function () {
                var items = this._state() || [];
                this._emptyState(!items.length);
                if (items.length) {
                    this.element.html(this._targetsHTML(items));
                }
            },
            _targetsHTML: function (items) {
                var item;
                var html = '';
                var idx = 0;
                var options = this.options;
                var enabled = false;
                if (this.options.setting != 'measures') {
                    enabled = options.filterable || options.sortable;
                }
                if (items.length) {
                    for (; idx < items.length; idx++) {
                        item = items[idx];
                        item = item.name === undefined ? { name: item } : item;
                        html += this.template({
                            name: item.name,
                            menuenabled: enabled
                        });
                    }
                }
                return html;
            },
            refresh: function () {
                if (this.dataSource._preventRefresh) {
                    return;
                }
                var items = this.dataSource[this.options.setting]();
                this._emptyState(!this._state().length);
                this._state(items, true);
                if (items.length) {
                    this.element.html(this._targetsHTML(items));
                }
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                this.dataSource.unbind(CHANGE, this._refreshHandler);
                this.element.off(NS);
                if (this.sortable) {
                    this.sortable.destroy();
                }
                if (this.fieldMenu) {
                    this.fieldMenu.destroy();
                }
                this.element = null;
                this._refreshHandler = null;
            }
        });
        var PivotConfiguratorButton = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that.element = $(element);
                that._element();
                that._attachEvents();
            },
            options: {
                name: 'PivotConfiguratorButton',
                text: 'Change settings',
                configurator: ''
            },
            destroy: function () {
                this.element.off(NS);
            },
            setOptions: function (options) {
                var that = this;
                kendo.deepExtend(that.options, options);
                this.init(this.element, this.options);
            },
            toggle: function () {
                var attr = kendo.attr('role');
                var pivotEl = this.element.closest('[' + attr + '=pivotcontainer]').find('[' + attr + '=pivotgridv2]');
                var pivot;
                $('#' + this.options.configurator).toggleClass('k-hidden');
                if (pivotEl.length) {
                    pivot = pivotEl.getKendoPivotGridV2();
                    pivot._setContentWidth();
                    pivot._updateDimensions();
                }
            },
            _attachEvents: function () {
                this.element.on('click' + NS, $.proxy(this.toggle, this));
            },
            _element: function () {
                var options = this.options;
                this.element.addClass('k-pivotgrid-configurator-button');
                this.element.html(kendo.format('<span>{0}<span class=\'k-icon k-i-gear k-color-inherit\'></span></span>', options.text));
            }
        });
        var PivotContainer = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that.element = $(element);
                that.options = options;
                that._addClasses();
            },
            options: {
                name: 'PivotContainer',
                configuratorPosition: 'left'
            },
            setOptions: function (options) {
                var that = this;
                kendo.deepExtend(that.options, options);
                this.init(this.element, this.options);
            },
            _addClasses: function () {
                var options = this.options;
                var className;
                this.element.removeClass('k-flex-row k-flex-row-reverse k-flex-column k-flex-column-reverse');
                switch (options.configuratorPosition) {
                case 'right':
                    className = 'k-flex-row';
                    break;
                case 'left':
                    className = 'k-flex-row-reverse';
                    break;
                case 'bottom':
                    className = 'k-flex-column';
                    break;
                case 'top':
                    className = 'k-flex-column-reverse';
                    break;
                default:
                    className = 'k-flex-row';
                }
                this.element.addClass('k-d-flex k-pos-relative').addClass(className);
            }
        });
        var PivotGridV2 = Widget.extend({
            init: function (element, options) {
                var that = this;
                Widget.fn.init.call(that, element, options);
                that._dataSource();
                that._bindConfigurator();
                that._wrapper();
                that._columnHeadersWrapper = $('<div class="k-pivotgrid-column-headers"></div>');
                that._rowHeadersWrapper = $('<div class="k-pivotgrid-row-headers"></div>');
                that._contentWrapper = $('<div class="k-pivotgrid-values"></div>');
                that.wrapper.append(that._columnHeadersWrapper);
                that.wrapper.append(that._rowHeadersWrapper);
                that.wrapper.append(that._contentWrapper);
                that._columnBuilder = new ColumnRowBuilder({
                    template: this.options.columnHeaderTemplate,
                    axes: 'columns'
                });
                that._rowBuilder = new ColumnRowBuilder({
                    template: this.options.rowHeaderTemplate,
                    axes: 'rows'
                });
                that._contentBuilder = new ContentBuilderV2({ template: this.options.dataCellTemplate || DATACELL_TEMPLATE });
                that._scrollable();
                that._rowHeadersWrapper.add(that._columnHeadersWrapper).on('click', 'span.k-icon', function () {
                    var button = $(this);
                    var path = button.parent().attr(kendo.attr('key'));
                    var expanded = button.hasClass('k-i-arrow-chevron-up');
                    var isRow = button.closest('.k-pivotgrid-row-headers').length !== 0;
                    var paths = path.split(',');
                    var eventName = expanded ? COLLAPSEMEMBER : EXPANDMEMBER;
                    if (that.trigger(eventName, {
                            path: paths,
                            axis: isRow ? 'rows' : 'columns'
                        })) {
                        return;
                    }
                    var reducerPayLoad = {
                        type: 'HEADERS_ACTION_TOGGLE',
                        payload: paths,
                        tree: isRow ? that._rowBuilder.getTree() : that._columnBuilder.getTree()
                    };
                    var currentAxes = isRow ? that.dataSource._rows : that.dataSource._columns;
                    var newHeaders = headersReducer(currentAxes, reducerPayLoad);
                    that.dataSource._preventRefresh = true;
                    if (isRow) {
                        that.dataSource.rows(newHeaders);
                    } else {
                        that.dataSource.columns(newHeaders);
                    }
                });
                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
                kendo.notify(that);
            },
            events: [
                DATABINDING,
                DATABOUND,
                EXPANDMEMBER,
                COLLAPSEMEMBER
            ],
            options: {
                name: 'PivotGridV2',
                autoBind: true,
                height: null,
                columnWidth: null,
                configurator: '',
                columnHeaderTemplate: null,
                rowHeaderTemplate: null,
                dataCellTemplate: null
            },
            destroy: function () {
                var that = this;
                Widget.fn.destroy.call(that);
                if (that._windowResizeHandler) {
                    $(window).off(RESIZE + NS, that._windowResizeHandler);
                    that._windowResizeHandler = null;
                }
            },
            _dataSource: function () {
                var that = this;
                var dataSource = that.options.dataSource;
                dataSource = $.isArray(dataSource) ? { data: dataSource } : dataSource;
                if (that.dataSource && this._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler).unbind(PROGRESS, that._progressHandler).unbind(ERROR, that._errorHandler);
                } else {
                    that._refreshHandler = $.proxy(that.refresh, that);
                    that._progressHandler = $.proxy(that._requestStart, that);
                    that._errorHandler = $.proxy(that._error, that);
                }
                that.dataSource = kendo.data.PivotDataSourceV2.create(dataSource).bind(CHANGE, that._refreshHandler).bind(PROGRESS, that._progressHandler).bind(ERROR, that._errorHandler);
            },
            _resize: function () {
                var that = this;
                that.wrapper[0].style.setProperty('--kendo-scrollbar-width', kendo.format('{0}px', getScollWidth()));
            },
            _scrollable: function () {
                var that = this;
                var columnsHeader = that._columnHeadersWrapper;
                var rowsHeader = that._rowHeadersWrapper;
                that._resize();
                that._windowResizeHandler = $.proxy(that._resize, that);
                that._contentWrapper.scroll(function () {
                    kendo.scrollLeft(columnsHeader, this.scrollLeft);
                    rowsHeader.scrollTop(this.scrollTop);
                });
                rowsHeader.bind('DOMMouseScroll' + NS + ' mousewheel' + NS, $.proxy(that._wheelScroll, that));
                $(window).on(RESIZE + NS, that._windowResizeHandler);
            },
            _wheelScroll: function (e) {
                if (e.ctrlKey) {
                    return;
                }
                var delta = kendo.wheelDeltaY(e);
                var scrollTop = this._contentWrapper.scrollTop();
                if (delta) {
                    e.preventDefault();
                    $(e.currentTarget).one('wheel' + NS, false);
                    this._rowHeadersWrapper.scrollTop(scrollTop + -delta);
                    this._contentWrapper.scrollTop(scrollTop + -delta);
                }
            },
            _wrapper: function () {
                var height = this.options.height;
                this.wrapper = this.element.addClass('k-widget k-pivotgrid');
                this.wrapper.append('<span class="k-pivotgrid-empty-cell" />');
                if (height) {
                    this.wrapper.css('height', height);
                }
            },
            _progress: function (toggle) {
                kendo.ui.progress(this.wrapper, toggle);
            },
            _error: function () {
                this._progress(false);
            },
            _requestStart: function () {
                this._progress(true);
            },
            _updateDimensions: function () {
                var that = this;
                that.wrapper.css({
                    'grid-template-columns': kendo.format('{0}px 1fr', that._rowHeadersWrapper.find('.k-pivotgrid-table')[0].offsetWidth),
                    'grid-template-rows': kendo.format('{0}px 1fr', that._columnHeadersWrapper.find('.k-pivotgrid-table')[0].offsetHeight)
                });
            },
            _setContentWidth: function () {
                if (!this.options.columnWidth) {
                    return;
                }
                var contentTable = this._contentWrapper.find('table');
                var columnTable = this._columnHeadersWrapper.children('table');
                var rowLength = contentTable.children('colgroup').children().length;
                var calculatedWidth = rowLength * this.options.columnWidth;
                var minWidth = Math.ceil(calculatedWidth / this._contentWrapper.width() * 100);
                if (minWidth < 100) {
                    minWidth = 100;
                }
                contentTable.add(columnTable).css('width', minWidth + '%');
            },
            _bindConfigurator: function () {
                var configurator = this.options.configurator;
                if (configurator) {
                    $(configurator).kendoPivotConfiguratorV2('setDataSource', this.dataSource);
                }
            },
            cellInfoByElement: function (element) {
                element = $(element);
                return this.cellInfo(element.index(), element.parent('tr').index());
            },
            cellInfo: function (columnIndex, rowIndex) {
                var contentBuilder = this._contentBuilder;
                var dataIndex;
                var dataItem;
                if (columnIndex >= contentBuilder.columnsCount || columnIndex < 0 || rowIndex >= contentBuilder.rowsCount || rowIndex < 0) {
                    return null;
                }
                dataIndex = rowIndex * contentBuilder.columnsCount + columnIndex;
                dataItem = contentBuilder.hash[dataIndex < 0 ? 0 : dataIndex];
                return {
                    columnTuple: dataItem.columnTuple,
                    rowTuple: dataItem.rowTuple,
                    dataItem: dataItem.data
                };
            },
            refresh: function () {
                var that = this;
                var dataSource = that.dataSource;
                if (that.trigger(DATABINDING, { action: 'rebind' })) {
                    return;
                }
                that._columnBuilder.setTuples(dataSource._columnTuples);
                that._columnHeadersWrapper.html(that._columnBuilder.build());
                that._rowBuilder.setTuples(dataSource._rowTuples);
                that._rowHeadersWrapper.html(that._rowBuilder.build());
                that._contentBuilder.setRowColumnInfo({
                    columnHeaderLeafs: that._columnBuilder.getHeaderLeafs(),
                    rowHeaderLeafs: that._rowBuilder.getHeaderLeafs(),
                    columnHeaderBreadth: that._columnBuilder.getBreadth(),
                    rowHeaderDepth: that._rowBuilder.getBreadth(),
                    data: dataSource._view
                });
                that._contentWrapper.html(that._contentBuilder.build());
                that._setContentWidth();
                that._updateDimensions();
                that._progress(false);
                that.trigger(DATABOUND);
            }
        });
        ui.plugin(PivotConfiguratorButton);
        ui.plugin(PivotContainer);
        ui.plugin(PivotGridV2);
        var PivotGrid = Widget.extend({
            init: function (element, options) {
                var that = this;
                var columnBuilder;
                var rowBuilder;
                Widget.fn.init.call(that, element, options);
                that._dataSource();
                that._bindConfigurator();
                that._wrapper();
                that._createLayout();
                that._columnBuilder = columnBuilder = new ColumnBuilder();
                that._rowBuilder = rowBuilder = new RowBuilder();
                that._contentBuilder = new ContentBuilder();
                that._templates();
                that.columnsHeader.add(that.rowsHeader).on('click', 'span.k-icon', function () {
                    var button = $(this);
                    var builder = columnBuilder;
                    var action = 'expandColumn';
                    var eventName;
                    var path = button.attr(kendo.attr('path'));
                    var eventArgs = {
                        axis: 'columns',
                        path: $.parseJSON(path)
                    };
                    if (button.parent().is('td')) {
                        builder = rowBuilder;
                        action = 'expandRow';
                        eventArgs.axis = 'rows';
                    }
                    var expanded = button.hasClass(STATE_EXPANDED);
                    var metadata = builder.metadata[path];
                    var request = metadata.expanded === undefined;
                    eventName = expanded ? COLLAPSEMEMBER : EXPANDMEMBER;
                    eventArgs.childrenLoaded = metadata.maxChildren > metadata.children;
                    if (that.trigger(eventName, eventArgs)) {
                        return;
                    }
                    builder.metadata[path].expanded = !expanded;
                    button.toggleClass(STATE_EXPANDED, !expanded).toggleClass(STATE_COLLAPSED, expanded);
                    if (!expanded && request) {
                        that.dataSource[action](eventArgs.path);
                    } else {
                        that.refresh();
                    }
                });
                that._scrollable();
                if (that.options.autoBind) {
                    that.dataSource.fetch();
                }
                kendo.notify(that);
            },
            events: [
                DATABINDING,
                DATABOUND,
                EXPANDMEMBER,
                COLLAPSEMEMBER
            ],
            options: {
                name: 'PivotGrid',
                autoBind: true,
                reorderable: true,
                filterable: false,
                sortable: false,
                height: null,
                columnWidth: 100,
                configurator: '',
                columnHeaderTemplate: null,
                rowHeaderTemplate: null,
                dataCellTemplate: null,
                kpiStatusTemplate: null,
                kpiTrendTemplate: null,
                messages: {
                    measureFields: 'Drop Data Fields Here',
                    columnFields: 'Drop Column Fields Here',
                    rowFields: 'Drop Rows Fields Here'
                }
            },
            _templates: function () {
                var columnTemplate = this.options.columnHeaderTemplate;
                var rowTemplate = this.options.rowHeaderTemplate;
                var dataTemplate = this.options.dataCellTemplate;
                var kpiStatusTemplate = this.options.kpiStatusTemplate;
                var kpiTrendTemplate = this.options.kpiTrendTemplate;
                this._columnBuilder.template = kendo.template(columnTemplate || HEADER_TEMPLATE, { useWithBlock: !!columnTemplate });
                this._contentBuilder.dataTemplate = kendo.template(dataTemplate || DATACELL_TEMPLATE, { useWithBlock: !!dataTemplate });
                this._contentBuilder.kpiStatusTemplate = kendo.template(kpiStatusTemplate || KPISTATUS_TEMPLATE, { useWithBlock: !!kpiStatusTemplate });
                this._contentBuilder.kpiTrendTemplate = kendo.template(kpiTrendTemplate || KPITREND_TEMPLATE, { useWithBlock: !!kpiTrendTemplate });
                this._rowBuilder.template = kendo.template(rowTemplate || HEADER_TEMPLATE, { useWithBlock: !!rowTemplate });
            },
            _bindConfigurator: function () {
                var configurator = this.options.configurator;
                if (configurator) {
                    $(configurator).kendoPivotConfigurator('setDataSource', this.dataSource);
                }
            },
            cellInfoByElement: function (element) {
                element = $(element);
                return this.cellInfo(element.index(), element.parent('tr').index());
            },
            cellInfo: function (columnIndex, rowIndex) {
                var contentBuilder = this._contentBuilder;
                var columnInfo = contentBuilder.columnIndexes[columnIndex || 0];
                var rowInfo = contentBuilder.rowIndexes[rowIndex || 0];
                var dataIndex;
                if (!columnInfo || !rowInfo) {
                    return null;
                }
                dataIndex = rowInfo.index * contentBuilder.rowLength + columnInfo.index;
                return {
                    columnTuple: columnInfo.tuple,
                    rowTuple: rowInfo.tuple,
                    measure: columnInfo.measure || rowInfo.measure,
                    dataItem: this.dataSource.view()[dataIndex]
                };
            },
            setDataSource: function (dataSource) {
                this.options.dataSource = dataSource;
                this._dataSource();
                if (this.measuresTarget) {
                    this.measuresTarget.setDataSource(dataSource);
                }
                if (this.rowsTarget) {
                    this.rowsTarget.setDataSource(dataSource);
                }
                if (this.columnsTarget) {
                    this.columnsTarget.setDataSource(dataSource);
                }
                this._bindConfigurator();
                if (this.options.autoBind) {
                    dataSource.fetch();
                }
            },
            setOptions: function (options) {
                Widget.fn.setOptions.call(this, options);
                this._templates();
            },
            destroy: function () {
                Widget.fn.destroy.call(this);
                clearTimeout(this._headerReflowTimeout);
            },
            _dataSource: function () {
                var that = this;
                var dataSource = that.options.dataSource;
                dataSource = Array.isArray(dataSource) ? { data: dataSource } : dataSource;
                if (that.dataSource && this._refreshHandler) {
                    that.dataSource.unbind(CHANGE, that._refreshHandler).unbind(STATERESET, that._stateResetHandler).unbind(PROGRESS, that._progressHandler).unbind(ERROR, that._errorHandler);
                } else {
                    that._refreshHandler = $.proxy(that.refresh, that);
                    that._progressHandler = $.proxy(that._requestStart, that);
                    that._stateResetHandler = $.proxy(that._stateReset, that);
                    that._errorHandler = $.proxy(that._error, that);
                }
                that.dataSource = kendo.data.PivotDataSource.create(dataSource).bind(CHANGE, that._refreshHandler).bind(PROGRESS, that._progressHandler).bind(STATERESET, that._stateResetHandler).bind(ERROR, that._errorHandler);
            },
            _error: function () {
                this._progress(false);
            },
            _requestStart: function () {
                this._progress(true);
            },
            _stateReset: function () {
                this._columnBuilder.reset();
                this._rowBuilder.reset();
            },
            _wrapper: function () {
                var height = this.options.height;
                this.wrapper = this.element.addClass('k-widget k-pivot');
                if (height) {
                    this.wrapper.css('height', height);
                }
            },
            _measureFields: function () {
                this.measureFields = $(DIV).addClass('k-pivot-toolbar k-toolbar k-settings-measures');
                this.measuresTarget = this._createSettingTarget(this.measureFields, {
                    setting: 'measures',
                    messages: { empty: this.options.messages.measureFields }
                });
            },
            _createSettingTarget: function (element, options) {
                var template;
                var sortable = options.sortable;
                var icons = '';
                if (sortable) {
                    icons += '#if (data.sortIcon) {#';
                    icons += '<span class="k-chip-action"><span class="k-icon ${data.sortIcon}-sm"></span></span>';
                    icons += '#}#';
                }
                if (options.filterable || sortable) {
                    icons += '<span class="k-setting-fieldmenu k-chip-action"><span class="k-icon k-i-more-vertical"></span></span>';
                }
                if (this.options.reorderable) {
                    icons += '<span class="k-setting-delete k-chip-action"><span class="k-icon k-i-close"></span></span>';
                }
                template = '' + '<span class="k-chip k-chip-md k-rounded-full k-chip-solid k-chip-solid-base" tabindex="0" data-' + kendo.ns + 'name="${data.name}">' + '<span class="k-chip-content">' + '<span class="k-chip-text">${data.name}</span>' + '</span>' + '<span class="k-chip-actions k-field-actions">' + icons + '</span>' + '</span>';
                return new kendo.ui.PivotSettingTarget(element, $.extend({
                    dataSource: this.dataSource,
                    template: template,
                    emptyTemplate: '<span class="k-empty">${data}</span>',
                    enabled: this.options.reorderable
                }, options));
            },
            _initSettingTargets: function () {
                this.columnsTarget = this._createSettingTarget(this.columnFields, {
                    connectWith: this.rowFields,
                    setting: 'columns',
                    filterable: this.options.filterable,
                    sortable: this.options.sortable,
                    messages: {
                        empty: this.options.messages.columnFields,
                        fieldMenu: this.options.messages.fieldMenu
                    }
                });
                this.rowsTarget = this._createSettingTarget(this.rowFields, {
                    connectWith: this.columnFields,
                    setting: 'rows',
                    filterable: this.options.filterable,
                    sortable: this.options.sortable,
                    messages: {
                        empty: this.options.messages.rowFields,
                        fieldMenu: this.options.messages.fieldMenu
                    }
                });
            },
            _createLayout: function () {
                var that = this;
                var layoutTable = $(LAYOUT_TABLE);
                var leftContainer = layoutTable.find('.k-pivot-rowheaders');
                var rightContainer = layoutTable.find('.k-pivot-table');
                var gridWrapper = $(DIV).addClass('k-grid k-widget');
                that._measureFields();
                that.columnFields = $(DIV).addClass('k-pivot-toolbar k-toolbar k-settings-columns');
                that.rowFields = $(DIV).addClass('k-pivot-toolbar k-toolbar k-settings-rows');
                that.columnsHeader = $('<div class="k-grid-header-wrap" />').wrap('<div class="k-grid-header" />');
                that.columnsHeader.parent().css('padding-right', kendo.support.scrollbar());
                that.rowsHeader = $('<div class="k-grid k-widget k-alt"/>');
                that.content = $('<div class="k-grid-content" />');
                leftContainer.append(that.measureFields);
                leftContainer.append(that.rowFields);
                leftContainer.append(that.rowsHeader);
                gridWrapper.append(that.columnsHeader.parent());
                gridWrapper.append(that.content);
                rightContainer.append(that.columnFields);
                rightContainer.append(gridWrapper);
                that.wrapper.append(layoutTable);
                that.columnsHeaderTree = new kendo.dom.Tree(that.columnsHeader[0]);
                that.rowsHeaderTree = new kendo.dom.Tree(that.rowsHeader[0]);
                that.contentTree = new kendo.dom.Tree(that.content[0]);
                that._initSettingTargets();
            },
            _progress: function (toggle) {
                kendo.ui.progress(this.wrapper, toggle);
            },
            _resize: function () {
                if (this.content[0].firstChild) {
                    this._setSectionsWidth();
                    this._setSectionsHeight();
                    this._setContentWidth();
                    this._setContentHeight();
                    this._columnHeaderReflow();
                }
            },
            _columnHeaderReflow: function () {
                var columnTable = this.columnsHeader.children('table');
                if (!kendo.support.browser.mozilla) {
                    return;
                }
                clearTimeout(this._headerReflowTimeout);
                columnTable.css('table-layout', 'auto');
                this._headerReflowTimeout = setTimeout(function () {
                    columnTable.css('table-layout', '');
                });
            },
            _setSectionsWidth: function () {
                var rowsHeader = this.rowsHeader;
                var leftColumn = rowsHeader.parent('.k-pivot-rowheaders').width(AUTO);
                var width;
                width = Math.max(outerWidth(this.measureFields), outerWidth(this.rowFields));
                width = Math.max(rowsHeader.children('table').width(), width);
                leftColumn.width(width);
            },
            _setSectionsHeight: function () {
                var measureFieldsHeight = this.measureFields.height(AUTO).height();
                var columnFieldsHeight = this.columnFields.height(AUTO).height();
                var rowFieldsHeight = this.rowFields.height(AUTO).innerHeight();
                var columnsHeight = this.columnsHeader.height(AUTO).innerHeight();
                var padding = rowFieldsHeight - this.rowFields.height();
                var firstRowHeight = columnFieldsHeight > measureFieldsHeight ? columnFieldsHeight : measureFieldsHeight;
                var secondRowHeight = columnsHeight > rowFieldsHeight ? columnsHeight : rowFieldsHeight;
                this.measureFields.height(firstRowHeight);
                this.columnFields.height(firstRowHeight);
                this.rowFields.height(secondRowHeight - padding);
                this.columnsHeader.height(secondRowHeight);
            },
            _setContentWidth: function () {
                var contentTable = this.content.find('table');
                var columnTable = this.columnsHeader.children('table');
                var rowLength = contentTable.children('colgroup').children().length;
                var calculatedWidth = rowLength * this.options.columnWidth;
                var minWidth = Math.ceil(calculatedWidth / this.content.width() * 100);
                if (minWidth < 100) {
                    minWidth = 100;
                }
                contentTable.add(columnTable).css('width', minWidth + '%');
                this._resetColspan(columnTable);
            },
            _setContentHeight: function () {
                var that = this;
                var content = that.content;
                var rowsHeader = that.rowsHeader;
                var innerHeight = that.wrapper.innerHeight();
                var scrollbar = kendo.support.scrollbar();
                var skipScrollbar = content[0].offsetHeight === content[0].clientHeight;
                var height = that.options.height;
                if (that.wrapper.is(':visible')) {
                    if (!innerHeight || !height) {
                        if (skipScrollbar) {
                            scrollbar = 0;
                        }
                        content.height('auto');
                        rowsHeader.height(content.height() - scrollbar);
                        return;
                    }
                    innerHeight -= outerHeight(that.columnFields);
                    innerHeight -= outerHeight(that.columnsHeader.parent());
                    if (innerHeight <= scrollbar * 2) {
                        innerHeight = scrollbar * 2 + 1;
                        if (!skipScrollbar) {
                            innerHeight += scrollbar;
                        }
                    }
                    content.height(innerHeight);
                    if (skipScrollbar) {
                        scrollbar = 0;
                    }
                    rowsHeader.height(innerHeight - scrollbar);
                }
            },
            _resetColspan: function (columnTable) {
                var that = this;
                var cell = columnTable.children('tbody').children().first().children().first();
                if (that._colspan === undefined) {
                    that._colspan = cell.attr('colspan');
                }
                cell.attr('colspan', 1);
                clearTimeout(that._layoutTimeout);
                that._layoutTimeout = setTimeout(function () {
                    cell.attr('colspan', that._colspan);
                    that._colspan = undefined;
                });
            },
            _axisMeasures: function (axis) {
                var result = [];
                var dataSource = this.dataSource;
                var measures = dataSource.measures();
                var hasMeasure = measures.length > 1 || measures[0] && measures[0].type;
                if (dataSource.measuresAxis() === axis) {
                    if (dataSource[axis]().length === 0 || hasMeasure) {
                        result = measures;
                    }
                }
                return result;
            },
            items: function () {
                return [];
            },
            refresh: function () {
                var that = this;
                var dataSource = that.dataSource;
                var axes = dataSource.axes();
                var columns = (axes.columns || {}).tuples || [];
                var rows = (axes.rows || {}).tuples || [];
                var columnBuilder = that._columnBuilder;
                var rowBuilder = that._rowBuilder;
                var columnAxis = {};
                var rowAxis = {};
                if (that.trigger(DATABINDING, { action: 'rebind' })) {
                    return;
                }
                columnBuilder.measures = that._axisMeasures(AXIS_COLUMNS);
                rowBuilder.measures = that._axisMeasures(AXIS_ROWS);
                that.columnsHeaderTree.render(columnBuilder.build(columns));
                that.rowsHeaderTree.render(rowBuilder.build(rows));
                columnAxis = {
                    indexes: columnBuilder._indexes,
                    measures: columnBuilder.measures,
                    metadata: columnBuilder.metadata
                };
                rowAxis = {
                    indexes: rowBuilder._indexes,
                    measures: rowBuilder.measures,
                    metadata: rowBuilder.metadata
                };
                that.contentTree.render(that._contentBuilder.build(dataSource.view(), columnAxis, rowAxis));
                that._resize();
                if (that.touchScroller) {
                    that.touchScroller.contentResized();
                } else {
                    var touchScroller = kendo.touchScroller(that.content);
                    if (touchScroller && touchScroller.movable) {
                        that.touchScroller = touchScroller;
                        touchScroller.movable.bind('change', function (e) {
                            kendo.scrollLeft(that.columnsHeader, -e.sender.x);
                            that.rowsHeader.scrollTop(-e.sender.y);
                        });
                    }
                }
                that._progress(false);
                that.trigger(DATABOUND);
            },
            _scrollable: function () {
                var that = this;
                var columnsHeader = that.columnsHeader;
                var rowsHeader = that.rowsHeader;
                that.content.on('scroll', function () {
                    kendo.scrollLeft(columnsHeader, this.scrollLeft);
                    rowsHeader.scrollTop(this.scrollTop);
                });
                rowsHeader.on('DOMMouseScroll' + NS + ' mousewheel' + NS, $.proxy(that._wheelScroll, that));
            },
            _wheelScroll: function (e) {
                if (e.ctrlKey) {
                    return;
                }
                var delta = kendo.wheelDeltaY(e);
                var scrollTop = this.content.scrollTop();
                if (delta) {
                    e.preventDefault();
                    $(e.currentTarget).one('wheel' + NS, false);
                    this.rowsHeader.scrollTop(scrollTop + -delta);
                    this.content.scrollTop(scrollTop + -delta);
                }
            }
        });
        var element = kendo.dom.element;
        var htmlNode = kendo.dom.html;
        var createMetadata = function (levelNum, memberIdx) {
            return {
                maxChildren: 0,
                children: 0,
                maxMembers: 0,
                members: 0,
                measures: 1,
                levelNum: levelNum,
                parentMember: memberIdx !== 0
            };
        };
        var buildPath = function (tuple, index) {
            var path = [];
            var idx = 0;
            for (; idx <= index; idx++) {
                path.push(tuple.members[idx].name);
            }
            return path;
        };
        var tupleName = function (tuple, index) {
            var name = '';
            var idx = 0;
            for (; idx <= index; idx++) {
                name += tuple.members[idx].name;
            }
            return name;
        };
        var ContentBuilderV2 = Class.extend({
            init: function (options) {
                this.template = kendo.template(options.template);
                this.hash = [];
            },
            setRowColumnInfo: function (options) {
                this.data = options.data;
                this.columnHeaderLeafs = options.columnHeaderLeafs;
                this.rowHeaderLeafs = options.rowHeaderLeafs;
                this.columnHeaderBreadth = options.columnHeaderBreadth;
                this.rowHeaderDepth = options.rowHeaderDepth;
                this.hash.length = 0;
            },
            addColElements: function (count) {
                var html = '';
                for (var index = 0; index < count; index++) {
                    html += '<col>';
                }
                this.table.find('colgroup').append(html);
            },
            addRowElements: function (data) {
                var that = this;
                var body = that.table.find('tbody');
                var row;
                for (var index = 0; index < data.length; index++) {
                    row = $('<tr class="k-pivotgrid-row"></tr>');
                    body.append(row);
                    that.addColumCell(row, data[index], index);
                }
                this.rowsCount = data.length;
            },
            addColumCell: function (rowEl, rowItem, rowIndex) {
                var that = this;
                for (var index = 0; index < rowItem.cells.length; index++) {
                    var cell = rowItem.cells[index];
                    if (cell) {
                        var cellEl = $('<td class="k-pivotgrid-cell"></td>');
                        if (this.rowHeaderLeafs[rowIndex].total || this.columnHeaderLeafs[index].total) {
                            cellEl.addClass('k-pivotgrid-header-total');
                        }
                        cellEl.append(that.template({
                            dataItem: cell.data,
                            rowTuple: cell.rowTuple,
                            columnTuple: cell.columnTuple
                        }));
                        this.hash.push(cell);
                        rowEl.append(cellEl);
                    }
                }
            },
            build: function () {
                var data = toData((this.data || []).slice(), this.columnHeaderLeafs, this.rowHeaderLeafs, this.columnHeaderBreadth, this.rowHeaderDepth);
                var that = this;
                var table = $('<table class=\'k-pivotgrid-table\'><colgroup></colgroup><tbody class=\'k-pivotgrid-tbody\'></tbody></table>');
                that.table = table;
                that.addColElements(this.columnHeaderLeafs.length);
                that.addRowElements(data);
                this.rowsCount = data.length;
                this.columnsCount = this.columnHeaderLeafs.length;
                return that.table;
            }
        });
        var ColumnRowBuilder = Class.extend({
            init: function (options) {
                this.tuples = options.tuples;
                this.axes = options.axes;
                this.headerTemplate = kendo.template(HEADERTEMPLATE);
                if (options.template) {
                    this.template = kendo.template(options.template);
                }
            },
            setTuples: function (tuples) {
                this.tuples = tuples;
            },
            addColElements: function (count) {
                var html = '';
                for (var index = 0; index < count; index++) {
                    html += '<col>';
                }
                this.table.find('colgroup').append(html);
            },
            addRowElements: function (columnHeaderRows) {
                var that = this;
                var body = that.table.find('tbody');
                var row;
                for (var index = 0; index < columnHeaderRows.length; index++) {
                    row = $('<tr class="k-pivotgrid-row"></tr>');
                    body.append(row);
                    that.addColumCell(row, columnHeaderRows[index]);
                }
            },
            addColumCell: function (rowEl, rowItem) {
                var that = this;
                var cellEl;
                var cell;
                for (var index = 0; index < rowItem.cells.length; index++) {
                    cell = rowItem.cells[index];
                    if (cell) {
                        cellEl = $(that.headerTemplate({
                            rowspan: cell.rowSpan,
                            colspan: cell.colSpan,
                            key: cell.path.join(',') + (cell.total ? '|[TOTAL]' : ''),
                            iconClass: cell.children && cell.children.length ? 'up' : 'down',
                            expandable: cell.hasChildren && !cell.total,
                            headerClass: kendo.format('k-pivotgrid-cell{0}{1}', cell.total ? ' k-pivotgrid-header-total' : '', cell.levelNum === 0 ? ' k-pivotgrid-header-root' : '')
                        }));
                        cellEl.append(that.template ? that.template({ member: cell }) : cell.caption);
                        rowEl.append(cellEl);
                    }
                }
            },
            build: function () {
                var tree = toTree((this.tuples || []).slice());
                var treeData = this.axes == 'columns' ? toColumns(tree) : toRows(tree);
                var headerRows = treeData[0];
                var headerLeafs = treeData[1];
                var breadth = treeData[2];
                var rowHeaderBreadth = treeData[3];
                var that = this;
                that._tree = tree;
                that._breadth = breadth;
                that._headerLeafs = headerLeafs;
                var table = $('<table class=\'k-pivotgrid-table\'><colgroup></colgroup><tbody class=\'k-pivotgrid-tbody\'></tbody></table>');
                that.table = table;
                that.addColElements(this.axes == 'columns' ? headerLeafs.length : rowHeaderBreadth);
                that.addRowElements(headerRows);
                return that.table;
            },
            getTree: function () {
                return this._tree;
            },
            getBreadth: function () {
                return this._breadth;
            },
            getHeaderLeafs: function () {
                return this._headerLeafs;
            }
        });
        var ColumnBuilder = Class.extend({
            init: function () {
                this.measures = 1;
                this.metadata = {};
            },
            build: function (tuples) {
                var tbody = this._tbody(tuples);
                var colgroup = this._colGroup();
                return [element('table', null, [
                        colgroup,
                        tbody
                    ])];
            },
            reset: function () {
                this.metadata = {};
            },
            _colGroup: function () {
                var length = this._rowLength();
                var children = [];
                var idx = 0;
                for (; idx < length; idx++) {
                    children.push(element('col', null));
                }
                return element('colgroup', null, children);
            },
            _tbody: function (tuples) {
                var root = tuples[0];
                this.map = {};
                this.rows = [];
                this.rootTuple = root;
                this._indexes = [];
                if (root) {
                    this._buildRows(root, 0);
                    this._normalize();
                } else {
                    this.rows.push(element('tr', null, [element('th', null, [htmlNode('&nbsp;')])]));
                }
                return element('tbody', null, this.rows);
            },
            _normalize: function () {
                var rows = this.rows;
                var rowsLength = rows.length;
                var rowIdx = 0;
                var row;
                var cellsLength;
                var cellIdx;
                var cells;
                var cell;
                for (; rowIdx < rowsLength; rowIdx++) {
                    row = rows[rowIdx];
                    if (row.rowSpan === 1) {
                        continue;
                    }
                    cells = row.children;
                    cellIdx = 0;
                    cellsLength = cells.length;
                    for (; cellIdx < cellsLength; cellIdx++) {
                        cell = cells[cellIdx];
                        if (cell.tupleAll) {
                            cell.attr.rowSpan = row.rowSpan;
                        }
                    }
                }
            },
            _rowIndex: function (row) {
                var rows = this.rows;
                var length = rows.length;
                var idx = 0;
                for (; idx < length; idx++) {
                    if (rows[idx] === row) {
                        break;
                    }
                }
                return idx;
            },
            _rowLength: function () {
                var cells = this.rows[0] ? this.rows[0].children : [];
                var length = cells.length;
                var rowLength = 0;
                var idx = 0;
                if (length) {
                    for (; idx < length; idx++) {
                        rowLength += cells[idx].attr.colSpan || 1;
                    }
                }
                if (!rowLength) {
                    rowLength = this.measures;
                }
                return rowLength;
            },
            _row: function (tuple, memberIdx, parentMember) {
                var rootName = this.rootTuple.members[memberIdx].name;
                var levelNum = tuple.members[memberIdx].levelNum;
                var rowKey = rootName + levelNum;
                var map = this.map;
                var parentRow;
                var children;
                var row = map[rowKey];
                if (!row) {
                    row = element('tr', null, []);
                    row.parentMember = parentMember;
                    row.collapsed = 0;
                    row.colSpan = 0;
                    row.rowSpan = 1;
                    map[rowKey] = row;
                    parentRow = map[rootName + (Number(levelNum) - 1)];
                    if (parentRow) {
                        children = parentRow.children;
                        if (children[1] && children[1].attr.className.indexOf('k-alt') === -1) {
                            row.notFirst = true;
                        } else {
                            row.notFirst = parentRow.notFirst;
                        }
                    }
                    this.rows.splice(this._rowIndex(parentRow) + 1, 0, row);
                } else {
                    row.notFirst = false;
                    if (!row.parentMember || row.parentMember !== parentMember) {
                        row.parentMember = parentMember;
                        row.collapsed = 0;
                        row.colSpan = 0;
                    }
                }
                return row;
            },
            _measures: function (measures, tuple, className) {
                var map = this.map;
                var row = map.measureRow;
                var measure;
                if (!row) {
                    row = element('tr', null, []);
                    map.measureRow = row;
                    this.rows.push(row);
                }
                for (var idx = 0, length = measures.length; idx < length; idx++) {
                    measure = measures[idx];
                    row.children.push(this._cell(className || '', [this._content(measure, tuple)], measure));
                }
                return length;
            },
            _content: function (member, tuple) {
                return htmlNode(this.template({
                    member: member,
                    tuple: tuple
                }));
            },
            _cell: function (className, children, member) {
                var cell = element('th', { className: 'k-header' + className }, children);
                cell.value = member.caption || member.name;
                return cell;
            },
            _buildRows: function (tuple, memberIdx, parentMember) {
                var members = tuple.members;
                var member = members[memberIdx];
                var nextMember = members[memberIdx + 1];
                var row, childRow, children, childrenLength;
                var cell, allCell, cellAttr;
                var cellChildren = [];
                var path;
                var idx = 0;
                var metadata;
                var colSpan;
                var collapsed = 0;
                var memberCollapsed = 0;
                if (member.measure) {
                    this._measures(member.children, tuple);
                    return;
                }
                path = kendo.stringify(buildPath(tuple, memberIdx));
                row = this._row(tuple, memberIdx, parentMember);
                children = member.children;
                childrenLength = children.length;
                metadata = this.metadata[path];
                if (!metadata) {
                    this.metadata[path] = metadata = createMetadata(Number(member.levelNum), memberIdx);
                    metadata.rootLevelNum = Number(this.rootTuple.members[memberIdx].levelNum);
                }
                this._indexes.push({
                    path: path,
                    tuple: tuple
                });
                if (member.hasChildren) {
                    if (metadata.expanded === false) {
                        collapsed = metadata.maxChildren;
                        row.collapsed += collapsed;
                        metadata.children = 0;
                        childrenLength = 0;
                    }
                    cellAttr = { className: 'k-icon ' + (childrenLength ? STATE_EXPANDED : STATE_COLLAPSED) };
                    cellAttr[kendo.attr('path')] = path;
                    cellChildren.push(element('span', cellAttr));
                }
                cellChildren.push(this._content(member, tuple));
                cell = this._cell(row.notFirst ? ' k-first' : '', cellChildren, member);
                row.children.push(cell);
                row.colSpan += 1;
                if (childrenLength) {
                    allCell = this._cell(' k-alt', [this._content(member, tuple)], member);
                    row.children.push(allCell);
                    for (; idx < childrenLength; idx++) {
                        childRow = this._buildRows(children[idx], memberIdx, member);
                    }
                    colSpan = childRow.colSpan;
                    collapsed = childRow.collapsed;
                    cell.attr.colSpan = colSpan;
                    metadata.children = colSpan;
                    metadata.members = 1;
                    row.colSpan += colSpan;
                    row.collapsed += collapsed;
                    row.rowSpan = childRow.rowSpan + 1;
                    if (nextMember) {
                        if (nextMember.measure) {
                            colSpan = this._measures(nextMember.children, tuple, ' k-alt');
                        } else {
                            childRow = this._buildRows(tuple, memberIdx + 1);
                            colSpan = childRow.colSpan;
                            row.collapsed += childRow.collapsed;
                            memberCollapsed = childRow.collapsed;
                        }
                        allCell.attr.colSpan = colSpan;
                        colSpan -= 1;
                        metadata.members += colSpan;
                        row.colSpan += colSpan;
                    }
                } else if (nextMember) {
                    if (nextMember.measure) {
                        colSpan = this._measures(nextMember.children, tuple);
                    } else {
                        childRow = this._buildRows(tuple, memberIdx + 1);
                        colSpan = childRow.colSpan;
                        row.collapsed += childRow.collapsed;
                        memberCollapsed = childRow.collapsed;
                    }
                    metadata.members = colSpan;
                    if (colSpan > 1) {
                        cell.attr.colSpan = colSpan;
                        row.colSpan += colSpan - 1;
                    }
                }
                if (metadata.maxMembers < metadata.members + memberCollapsed) {
                    metadata.maxMembers = metadata.members + memberCollapsed;
                }
                children = metadata.children + collapsed;
                if (metadata.maxChildren < children) {
                    metadata.maxChildren = children;
                }
                (allCell || cell).tupleAll = true;
                return row;
            }
        });
        var RowBuilder = Class.extend({
            init: function () {
                this.metadata = {};
            },
            build: function (tuples) {
                var tbody = this._tbody(tuples);
                var colgroup = this._colGroup();
                return [element('table', null, [
                        colgroup,
                        tbody
                    ])];
            },
            reset: function () {
                this.metadata = {};
            },
            _rowLength: function () {
                var children = this.rows[0].children;
                var length = 0;
                var idx = 0;
                var cell = children[idx];
                while (cell) {
                    length += cell.attr.colSpan || 1;
                    cell = children[++idx];
                }
                return length;
            },
            _colGroup: function () {
                var length = this._rowLength();
                var children = [];
                var idx = 0;
                for (; idx < length; idx++) {
                    children.push(element('col', null));
                }
                return element('colgroup', null, children);
            },
            _tbody: function (tuples) {
                var root = tuples[0];
                this.rootTuple = root;
                this.rows = [];
                this.map = {};
                this._indexes = [];
                if (root) {
                    this._buildRows(root, 0);
                    this._normalize();
                } else {
                    this.rows.push(element('tr', null, [element('td', null, [htmlNode('&nbsp;')])]));
                }
                return element('tbody', null, this.rows);
            },
            _normalize: function () {
                var rows = this.rows;
                var rowsLength = rows.length;
                var rowIdx = 0;
                var members = this.rootTuple.members;
                var firstMemberName = members[0].name;
                var membersLength = members.length;
                var memberIdx = 0;
                var row;
                var cell;
                var maxcolSpan;
                var map = this.map;
                var allRow;
                for (; rowIdx < rowsLength; rowIdx++) {
                    row = rows[rowIdx];
                    for (memberIdx = 0; memberIdx < membersLength; memberIdx++) {
                        maxcolSpan = this[members[memberIdx].name];
                        cell = row.colSpan['dim' + memberIdx];
                        if (cell && cell.colSpan < maxcolSpan) {
                            cell.attr.colSpan = maxcolSpan - cell.colSpan + 1;
                        }
                    }
                }
                row = map[firstMemberName];
                allRow = map[firstMemberName + 'all'];
                if (row) {
                    row.children[0].attr.className = 'k-first';
                }
                if (allRow) {
                    allRow.children[0].attr.className += ' k-first';
                }
            },
            _row: function (children) {
                var row = element('tr', null, children);
                row.rowSpan = 1;
                row.colSpan = {};
                this.rows.push(row);
                return row;
            },
            _content: function (member, tuple) {
                return htmlNode(this.template({
                    member: member,
                    tuple: tuple
                }));
            },
            _cell: function (className, children, member) {
                var cell = element('td', { className: className }, children);
                cell.value = member.caption || member.name;
                return cell;
            },
            _buildRows: function (tuple, memberIdx) {
                var map = this.map;
                var path;
                var members = tuple.members;
                var member = members[memberIdx];
                var nextMember = members[memberIdx + 1];
                var children = member.children;
                var childrenLength = children.length;
                var levelNum = Number(member.levelNum);
                var rootName = this.rootTuple.members[memberIdx].name;
                var tuplePath = buildPath(tuple, memberIdx - 1).join('');
                var rootLevelNum = Number(this.rootTuple.members[memberIdx].levelNum);
                var parentName = tuplePath + (rootLevelNum === levelNum ? '' : member.parentName || '');
                var row = map[parentName + 'all'] || map[parentName];
                var colSpan = levelNum + 1;
                var cell, allCell;
                var childRow, allRow;
                var metadata;
                var className;
                var cellChildren = [];
                var expandIconAttr;
                var idx;
                if (!row || row.hasChild) {
                    row = this._row();
                } else {
                    row.hasChild = true;
                }
                if (member.measure) {
                    className = row.allCell ? 'k-grid-footer' : '';
                    row.children.push(this._cell(className, [this._content(children[0], tuple)], children[0]));
                    row.rowSpan = childrenLength;
                    for (idx = 1; idx < childrenLength; idx++) {
                        this._row([this._cell(className, [this._content(children[idx], tuple)], children[idx])]);
                    }
                    return row;
                }
                map[tuplePath + member.name] = row;
                path = kendo.stringify(buildPath(tuple, memberIdx));
                metadata = this.metadata[path];
                if (!metadata) {
                    this.metadata[path] = metadata = createMetadata(levelNum, memberIdx);
                    metadata.rootLevelNum = rootLevelNum;
                }
                this._indexes.push({
                    path: path,
                    tuple: tuple
                });
                if (member.hasChildren) {
                    if (metadata.expanded === false) {
                        childrenLength = 0;
                        metadata.children = 0;
                    }
                    expandIconAttr = { className: 'k-icon ' + (childrenLength ? STATE_EXPANDED : STATE_COLLAPSED) };
                    expandIconAttr[kendo.attr('path')] = path;
                    cellChildren.push(element('span', expandIconAttr));
                }
                cellChildren.push(this._content(member, tuple));
                className = row.allCell && !childrenLength ? 'k-grid-footer' : '';
                cell = this._cell(className, cellChildren, member);
                cell.colSpan = colSpan;
                row.children.push(cell);
                row.colSpan['dim' + memberIdx] = cell;
                if (!this[rootName] || this[rootName] < colSpan) {
                    this[rootName] = colSpan;
                }
                if (childrenLength) {
                    row.allCell = false;
                    row.hasChild = false;
                    for (idx = 0; idx < childrenLength; idx++) {
                        childRow = this._buildRows(children[idx], memberIdx);
                        if (row !== childRow) {
                            row.rowSpan += childRow.rowSpan;
                        }
                    }
                    if (row.rowSpan > 1) {
                        cell.attr.rowSpan = row.rowSpan;
                    }
                    metadata.children = row.rowSpan;
                    allCell = this._cell('k-grid-footer', [this._content(member, tuple)], member);
                    allCell.colSpan = colSpan;
                    allRow = this._row([allCell]);
                    allRow.colSpan['dim' + memberIdx] = allCell;
                    allRow.allCell = true;
                    map[tuplePath + member.name + 'all'] = allRow;
                    if (nextMember) {
                        childRow = this._buildRows(tuple, memberIdx + 1);
                        allCell.attr.rowSpan = childRow.rowSpan;
                    }
                    row.rowSpan += allRow.rowSpan;
                    metadata.members = allRow.rowSpan;
                } else if (nextMember) {
                    row.hasChild = false;
                    this._buildRows(tuple, memberIdx + 1);
                    (allCell || cell).attr.rowSpan = row.rowSpan;
                    metadata.members = row.rowSpan;
                }
                if (metadata.maxChildren < metadata.children) {
                    metadata.maxChildren = metadata.children;
                }
                if (metadata.maxMembers < metadata.members) {
                    metadata.maxMembers = metadata.members;
                }
                return row;
            }
        });
        var ContentBuilder = Class.extend({
            init: function () {
                this.columnAxis = {};
                this.rowAxis = {};
            },
            build: function (data, columnAxis, rowAxis) {
                var index = columnAxis.indexes[0];
                var metadata = columnAxis.metadata[index ? index.path : undefined];
                this.columnAxis = columnAxis;
                this.rowAxis = rowAxis;
                this.data = data;
                this.rowLength = metadata ? metadata.maxChildren + metadata.maxMembers : columnAxis.measures.length || 1;
                if (!this.rowLength) {
                    this.rowLength = 1;
                }
                var tbody = this._tbody();
                var colgroup = this._colGroup();
                return [element('table', null, [
                        colgroup,
                        tbody
                    ])];
            },
            _colGroup: function () {
                var length = this.columnAxis.measures.length || 1;
                var children = [];
                var idx = 0;
                if (this.rows[0]) {
                    length = this.rows[0].children.length;
                }
                for (; idx < length; idx++) {
                    children.push(element('col', null));
                }
                return element('colgroup', null, children);
            },
            _tbody: function () {
                this.rows = [];
                if (this.data[0]) {
                    this.columnIndexes = this._indexes(this.columnAxis, this.rowLength);
                    this.rowIndexes = this._indexes(this.rowAxis, Math.ceil(this.data.length / this.rowLength));
                    this._buildRows();
                } else {
                    this.rows.push(element('tr', null, [element('td', null, [htmlNode('&nbsp;')])]));
                }
                return element('tbody', null, this.rows);
            },
            _indexes: function (axisInfo, total) {
                var result = [];
                var axisInfoMember;
                var indexes = axisInfo.indexes;
                var metadata = axisInfo.metadata;
                var measures = axisInfo.measures;
                var measuresLength = measures.length || 1;
                var current;
                var dataIdx = 0;
                var firstEmpty = 0;
                var idx = 0;
                var length = indexes.length;
                var measureIdx;
                var index;
                var children;
                var skipChildren;
                if (!length) {
                    for (measureIdx = 0; measureIdx < measuresLength; measureIdx++) {
                        result[measureIdx] = {
                            index: measureIdx,
                            measure: measures[measureIdx],
                            tuple: null
                        };
                    }
                    return result;
                }
                for (; idx < length; idx++) {
                    axisInfoMember = indexes[idx];
                    current = metadata[axisInfoMember.path];
                    children = current.children + current.members;
                    skipChildren = 0;
                    if (children) {
                        children -= measuresLength;
                    }
                    if (current.expanded === false && current.children !== current.maxChildren) {
                        skipChildren = current.maxChildren;
                    }
                    if (current.parentMember && current.levelNum === current.rootLevelNum) {
                        children = -1;
                    }
                    if (children > -1) {
                        for (measureIdx = 0; measureIdx < measuresLength; measureIdx++) {
                            index = children + measureIdx;
                            if (!current.children) {
                                index += firstEmpty;
                            }
                            result[children + firstEmpty + measureIdx] = {
                                children: children,
                                index: dataIdx,
                                measure: measures[measureIdx],
                                tuple: axisInfoMember.tuple
                            };
                            dataIdx += 1;
                        }
                        while (result[firstEmpty] !== undefined) {
                            firstEmpty += 1;
                        }
                    }
                    if (firstEmpty === total) {
                        break;
                    }
                    dataIdx += skipChildren;
                }
                return result;
            },
            _buildRows: function () {
                var rowIndexes = this.rowIndexes;
                var length = rowIndexes.length;
                var idx = 0;
                for (; idx < length; idx++) {
                    var rowIndex = rowIndexes[idx];
                    if (rowIndex) {
                        this.rows.push(this._buildRow(rowIndex));
                    }
                }
            },
            _buildRow: function (rowInfo) {
                var startIdx = rowInfo.index * this.rowLength;
                var columnIndexes = this.columnIndexes;
                var length = columnIndexes.length;
                var columnInfo;
                var cells = [];
                var idx = 0;
                var templateInfo;
                var cell, cellContent;
                var attr, dataItem, measure;
                for (; idx < length; idx++) {
                    columnInfo = columnIndexes[idx];
                    if (columnInfo === undefined) {
                        continue;
                    }
                    attr = {};
                    if (columnInfo.children) {
                        attr.className = 'k-alt';
                    }
                    cellContent = '';
                    dataItem = this.data[startIdx + columnInfo.index];
                    measure = columnInfo.measure || rowInfo.measure;
                    templateInfo = {
                        columnTuple: columnInfo.tuple,
                        rowTuple: rowInfo.tuple,
                        measure: measure,
                        dataItem: dataItem
                    };
                    if (dataItem.value !== '' && measure && measure.type) {
                        if (measure.type === 'status') {
                            cellContent = this.kpiStatusTemplate(templateInfo);
                        } else if (measure.type === 'trend') {
                            cellContent = this.kpiTrendTemplate(templateInfo);
                        }
                    }
                    if (!cellContent) {
                        cellContent = this.dataTemplate(templateInfo);
                    }
                    cell = element('td', attr, [htmlNode(cellContent)]);
                    cell.value = dataItem.value;
                    cells.push(cell);
                }
                attr = {};
                if (rowInfo.children) {
                    attr.className = 'k-grid-footer';
                }
                return element('tr', attr, cells);
            }
        });
        ui.plugin(PivotGrid);
        kendo.PivotExcelExporter = kendo.Class.extend({
            init: function (options) {
                this.options = options;
                this.widget = options.widget;
                this.dataSource = this.widget.dataSource;
            },
            _columns: function () {
                var columnHeaderTable = this.widget.columnsHeaderTree.children[0];
                var rowHeaderTable = this.widget.rowsHeaderTree.children[0];
                var columnHeaderLength = columnHeaderTable.children[0].children.length;
                var rowHeaderLength = rowHeaderTable.children[0].children.length;
                var width = this.widget.options.columnWidth;
                var result = [];
                var idx;
                if (rowHeaderLength && this.dataSource.data()[0]) {
                    for (idx = 0; idx < rowHeaderLength; idx++) {
                        result.push({ autoWidth: true });
                    }
                }
                for (idx = 0; idx < columnHeaderLength; idx++) {
                    result.push({
                        autoWidth: false,
                        width: width
                    });
                }
                return result;
            },
            _cells: function (rows, type, callback) {
                var result = [];
                var i = 0;
                var length = rows.length;
                var cellsLength;
                var row, cells;
                var j, cell;
                for (; i < length; i++) {
                    row = [];
                    cells = rows[i].children;
                    cellsLength = cells.length;
                    for (j = 0; j < cellsLength; j++) {
                        cell = cells[j];
                        row.push({
                            background: '#7a7a7a',
                            color: '#fff',
                            value: cell.value,
                            colSpan: cell.attr.colSpan || 1,
                            rowSpan: cell.attr.rowSpan || 1
                        });
                    }
                    if (callback) {
                        callback(row, i);
                    }
                    result.push({
                        cells: row,
                        type: type
                    });
                }
                return result;
            },
            _rows: function () {
                var columnHeaderTable = this.widget.columnsHeaderTree.children[0];
                var rowHeaderTable = this.widget.rowsHeaderTree.children[0];
                var columnHeaderLength = columnHeaderTable.children[0].children.length;
                var rowHeaderLength = rowHeaderTable.children[0].children.length;
                var columnHeaderRows = columnHeaderTable.children[1].children;
                var rowHeaderRows = rowHeaderTable.children[1].children;
                var contentRows = this.widget.contentTree.children[0].children[1].children;
                var columnRows = this._cells(columnHeaderRows, 'header');
                if (rowHeaderLength) {
                    columnRows[0].cells.splice(0, 0, {
                        background: '#7a7a7a',
                        color: '#fff',
                        value: '',
                        colSpan: rowHeaderLength,
                        rowSpan: columnHeaderRows.length
                    });
                }
                var dataCallback = function (row, index) {
                    var j = 0;
                    var cell, value;
                    var cells = contentRows[index].children;
                    for (; j < columnHeaderLength; j++) {
                        cell = cells[j];
                        value = Number(cell.value);
                        if (isNaN(value)) {
                            value = cell.value;
                        }
                        row.push({
                            background: '#dfdfdf',
                            color: '#333',
                            value: value,
                            colSpan: 1,
                            rowSpan: 1
                        });
                    }
                };
                var rowRows = this._cells(rowHeaderRows, 'data', dataCallback);
                return columnRows.concat(rowRows);
            },
            _freezePane: function () {
                var columnHeaderTable = this.widget.columnsHeaderTree.children[0];
                var rowHeaderTable = this.widget.rowsHeaderTree.children[0];
                var rowHeaderLength = rowHeaderTable.children[0].children.length;
                var columnHeaderRows = columnHeaderTable.children[1].children;
                return {
                    colSplit: rowHeaderLength,
                    rowSplit: columnHeaderRows.length
                };
            },
            workbook: function () {
                var promise;
                if (this.dataSource.view()[0]) {
                    promise = $.Deferred();
                    promise.resolve();
                } else {
                    promise = this.dataSource.fetch();
                }
                return promise.then($.proxy(function () {
                    return {
                        sheets: [{
                                columns: this._columns(),
                                rows: this._rows(),
                                freezePane: this._freezePane(),
                                filter: null
                            }]
                    };
                }, this));
            }
        });
        var PivotExcelMixin = {
            extend: function (proto) {
                proto.events.push('excelExport');
                proto.options.excel = $.extend(proto.options.excel, this.options);
                proto.saveAsExcel = this.saveAsExcel;
            },
            options: {
                proxyURL: '',
                filterable: false,
                fileName: 'Export.xlsx'
            },
            saveAsExcel: function () {
                var excel = this.options.excel || {};
                var exporter = new kendo.PivotExcelExporter({ widget: this });
                exporter.workbook().then($.proxy(function (book) {
                    if (!this.trigger('excelExport', { workbook: book })) {
                        var workbook = new kendo.ooxml.Workbook(book);
                        workbook.toDataURLAsync().then(function (dataURI) {
                            kendo.saveAs({
                                dataURI: dataURI,
                                fileName: book.fileName || excel.fileName,
                                proxyURL: excel.proxyURL,
                                forceProxy: excel.forceProxy
                            });
                        });
                    }
                }, this));
            }
        };
        kendo.PivotExcelMixin = PivotExcelMixin;
        if (kendo.ooxml && kendo.ooxml.Workbook) {
            PivotExcelMixin.extend(PivotGrid.prototype);
        }
        if (kendo.PDFMixin) {
            kendo.PDFMixin.extend(PivotGrid.prototype);
            PivotGrid.fn._drawPDF = function () {
                return this._drawPDFShadow({ width: this.wrapper.width() }, { avoidLinks: this.options.pdf.avoidLinks });
            };
        }
        if (kendo.PDFMixin) {
            kendo.PDFMixin.extend(PivotGridV2.prototype);
            PivotGridV2.fn._drawPDF = function () {
                return this._drawPDFShadow({ width: this.wrapper.width() }, { avoidLinks: this.options.pdf.avoidLinks });
            };
        }
    }(window.kendo.jQuery));
    return window.kendo;
}, typeof define == 'function' && define.amd ? define : function (a1, a2, a3) {
    (a3 || a2)();
}));