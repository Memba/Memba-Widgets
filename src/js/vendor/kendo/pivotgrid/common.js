/**
 * Kendo UI v2023.3.1114 (http://www.telerik.com/kendo-ui)
 * Copyright 2023 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.
 *
 * Kendo UI commercial licenses may be obtained at
 * http://www.telerik.com/purchase/license-agreement/kendo-ui-complete
 * If you do not own a commercial license, this file shall be governed by the trial license terms.
 */
import "../kendo.core.js";

(function () {

window.kendo.pivotgrid = window.kendo.pivotgrid || {};
window.kendo.pivotgrid.common = (function (exports) {
    

    var filterFunctionFormats = {
        contains: ", InStr({0}.CurrentMember.MEMBER_CAPTION,\"{1}\") > 0",
        doesnotcontain: ", InStr({0}.CurrentMember.MEMBER_CAPTION,\"{1}\")",
        endswith: ", Right({0}.CurrentMember.MEMBER_CAPTION,Len(\"{1}\"))=\"{1}\"",
        eq: ", {0}.CurrentMember.MEMBER_CAPTION = \"{1}\"",
        neq: ", {0}.CurrentMember.MEMBER_CAPTION = \"{1}\"",
        startswith: ", Left({0}.CurrentMember.MEMBER_CAPTION,Len(\"{1}\"))=\"{1}\""
    };
    var operators = {
        doesnotcontain: 'doesnotcontain',
        in: 'in',
        neq: "neq"
    };
    /**
     * @hidden
     */
    function serializeFilters(filters, cube) {
        var command = "";
        var current = "";
        for (var idx = filters.length - 1; idx >= 0; idx--) {
            current = "SELECT (";
            current += serializeExpression(filters[idx]);
            current += ") ON 0";
            if (idx === filters.length - 1) {
                current += " FROM [" + cube + "]";
                command = current;
            }
            else {
                command = current + " FROM ( " + command + " )";
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
            command += "{";
            command += value;
            command += "}";
        }
        else {
            command += operator === operators.neq || operator === operators.doesnotcontain ? '-' : '';
            command += "Filter(";
            command += field + ".MEMBERS";
            command += formatString(filterFunctionFormats[operator], field, value);
            command += ")";
        }
        return command;
    }
    function formatString(str) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        values.forEach(function (value, index) {
            str = str.replace(new RegExp("\\{" + index + "\\}", 'g'), value);
        });
        return str;
    }

    /**
     * @hidden
     */
    function serializeMembers(members, measures, sort) {
        var command = "";
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
            command += crossJoinCommands.join(",");
        }
        else {
            for (; idx < length; idx++) {
                memberName = expandMemberDescriptor(expanded[idx].name, sort);
                names.push(memberName[0]);
            }
            command += rootNames.concat(names).join(",");
        }
        return command;
    }
    /**
     * @hidden
     */
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
            if (!root.some(function (n) { return n.indexOf(hierarchyName) === 0; })) {
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
            }
            else {
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
            tmp.push("{" + measureNames(measures).join(",") + "}");
        }
        return crossJoin(tmp);
    }
    function expandMemberDescriptor(names, sort) {
        var idx = names.length - 1;
        var name = names[idx];
        var sortDescriptor = sortDescriptorForMember(sort, name);
        if (sortDescriptor && sortDescriptor.dir) {
            name = "ORDER(" + name + ".Children," + sortDescriptor.field + ".CurrentMember.MEMBER_CAPTION," + sortDescriptor.dir + ")";
        }
        else {
            name += ".Children";
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
        var parts = memberName.split(".");
        if (parts.length > 2) {
            return parts[0] + "." + parts[1];
        }
        return memberName;
    }
    function crossJoin(names) {
        var result = "CROSSJOIN({";
        var name;
        if (names.length > 2) {
            name = names.pop();
            result += crossJoin(names);
        }
        else {
            result += names.shift();
            name = names.pop();
        }
        result += "},{";
        result += name;
        result += "})";
        return result;
    }

    /**
     * @hidden
     */
    function createRequestBody(options) {
        var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Execute xmlns="urn:schemas-microsoft-com:xml-analysis"><Command><Statement>';
        var _a = options.columnAxes, columnAxes = _a === void 0 ? [] : _a, _b = options.rowAxes, rowAxes = _b === void 0 ? [] : _b;
        var _c = options.measureAxes, measureAxes = _c === void 0 ? [] : _c, _d = options.sort, sort = _d === void 0 ? [] : _d, _e = options.filter, filter = _e === void 0 ? [] : _e;
        var measuresRowAxis = options.measuresAxis === "rows";
        command += "SELECT NON EMPTY {";
        if (!columnAxes.length && rowAxes.length && (!measureAxes.length || (measureAxes.length && measuresRowAxis))) {
            columnAxes = rowAxes;
            rowAxes = [];
            measuresRowAxis = false;
        }
        if (!columnAxes.length && !rowAxes.length) {
            measuresRowAxis = false;
        }
        if (columnAxes.length) {
            command += serializeMembers(columnAxes, !measuresRowAxis ? measureAxes : [], sort);
        }
        else if (measureAxes.length && !measuresRowAxis) {
            command += measureNames(measureAxes).join(",");
        }
        command += "} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON COLUMNS";
        if (rowAxes.length || (measuresRowAxis && measureAxes.length > 1)) {
            command += ", NON EMPTY {";
            if (rowAxes.length) {
                command += serializeMembers(rowAxes, measuresRowAxis ? measureAxes : [], sort);
            }
            else {
                command += measureNames(measureAxes).join(",");
            }
            command += "} DIMENSION PROPERTIES CHILDREN_CARDINALITY, PARENT_UNIQUE_NAME ON ROWS";
        }
        if (filter.length) {
            command += " FROM ";
            command += "(";
            command += serializeFilters(filter, options.connection.cube);
            command += ")";
        }
        else {
            command += " FROM [" + options.connection.cube + "]";
        }
        if (measureAxes.length === 1 && columnAxes.length) {
            command += " WHERE (" + measureNames(measureAxes).join(",") + ")";
        }
        command += '</Statement></Command><Properties><PropertyList><Catalog>' + options.connection.catalog + '</Catalog><Format>Multidimensional</Format></PropertyList></Properties></Execute></Body></Envelope>';
        return command.replace(/&/g, "&amp;");
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /**
     * @hidden
     */
    function parseResponse(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var axes = Array.from(xmlDoc.querySelectorAll("Axis"));
        var cells = Array.from(xmlDoc.querySelectorAll("CellData > Cell"))
            .map(function (cell) { return ({
            fmtValue: getPropertyValue(cell, "FmtValue"),
            ordinal: parseInt(cell.getAttribute("CellOrdinal"), 10),
            value: getPropertyValue(cell, "Value")
        }); });
        var columns = { tuples: [] };
        var rows = { tuples: [] };
        var data = [];
        axes.forEach(function (axis) {
            if (axis.getAttribute('name') !== "SlicerAxis") {
                var tuples = columns.tuples.length === 0 ? columns.tuples : rows.tuples;
                Array.prototype.push.apply(tuples, translateAxis(axis));
            }
        });
        var indexedData = new Array(rows.tuples.length * columns.tuples.length).fill(null);
        cells.forEach(function (c) { indexedData[c.ordinal] = c; });
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
        return { columns: columns, data: data, rows: rows };
    }
    /**
     * @hidden
     */
    function getPropertyValue(member, name) {
        var node = member.querySelector(name);
        return node ? node.textContent : "";
    }
    function translateAxis(axis) {
        var tuples = Array.from(axis.querySelectorAll("Tuple"));
        return tuples.map(function (tuple) {
            var memberElements = Array.from(tuple.querySelectorAll("Member"));
            var members = memberElements.map(function (member) {
                var lNum = parseInt(getPropertyValue(member, "LNum") || "0", 10);
                var hasChildren = parseInt(getPropertyValue(member, "CHILDREN_CARDINALITY") || "0", 10) > 0;
                return {
                    caption: getPropertyValue(member, "Caption"),
                    children: [],
                    hasChildren: hasChildren,
                    hierarchy: member.getAttribute('Hierarchy'),
                    levelName: getPropertyValue(member, "LName"),
                    levelNum: lNum,
                    name: getPropertyValue(member, "UName"),
                    parentName: getPropertyValue(member, "PARENT_UNIQUE_NAME")
                };
            });
            return { members: members };
        });
    }

    /**
     * @hidden
     */
    var discoverCommands = {
        schemaCatalogs: "DBSCHEMA_CATALOGS",
        schemaCubes: "MDSCHEMA_CUBES",
        schemaDimensions: "MDSCHEMA_DIMENSIONS",
        schemaHierarchies: "MDSCHEMA_HIERARCHIES",
        schemaKPIs: "MDSCHEMA_KPIS",
        schemaLevels: "MDSCHEMA_LEVELS",
        schemaMeasures: "MDSCHEMA_MEASURES",
        schemaMembers: "MDSCHEMA_MEMBERS"
    };
    /**
     * @hidden
     */
    function createDiscoverBody(options) {
        var properties = {};
        var command = '<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Header/><Body><Discover xmlns="urn:schemas-microsoft-com:xml-analysis">';
        command += "<RequestType>" + (discoverCommands[options.command] || options.command) + "</RequestType>";
        command += "<Restrictions>" + serializeOptions("RestrictionList", options.restrictions, true) + "</Restrictions>";
        if (options.connection && options.connection.catalog) {
            properties.Catalog = options.connection.catalog;
        }
        command += "<Properties>" + serializeOptions("PropertyList", properties, false) + "</Properties>";
        command += '</Discover></Body></Envelope>';
        return command;
    }
    function serializeOptions(parentTagName, options, capitalize) {
        var result = "";
        if (options) {
            result += "<" + parentTagName + ">";
            var value = void 0;
            for (var key in options) {
                if (options[key]) {
                    value = options[key];
                    if (capitalize) {
                        key = key.replace(/([A-Z]+(?=$|[A-Z][a-z])|[A-Z]?[a-z]+)/g, "$1_").toUpperCase().replace(/_$/, "");
                    }
                    result += "<" + key + ">" + value + "</" + key + ">";
                }
            }
            result += "</" + parentTagName + ">";
        }
        else {
            result += "<" + parentTagName + "/>";
        }
        return result;
    }

    /**
     * @hidden
     */
    function parseCubes(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            name: getPropertyValue(row, "CUBE_NAME"),
            caption: getPropertyValue(row, "CUBE_CAPTION"),
            description: getPropertyValue(row, "DESCRIPTION"),
            type: getPropertyValue(row, "CUBE_TYPE")
        }); });
        return rows;
    }
    /**
     * @hidden
     */
    function parseCatalogs(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            name: getPropertyValue(row, "CATALOG_NAME"),
            description: getPropertyValue(row, "DESCRIPTION")
        }); });
        return rows;
    }
    /**
     * @hidden
     */
    function parseMeasures(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            name: getPropertyValue(row, "MEASURE_NAME"),
            caption: getPropertyValue(row, "MEASURE_CAPTION"),
            uniqueName: getPropertyValue(row, "MEASURE_UNIQUE_NAME"),
            description: getPropertyValue(row, "DESCRIPTION"),
            aggregator: getPropertyValue(row, "MEASURE_AGGREGATOR"),
            groupName: getPropertyValue(row, "MEASUREGROUP_NAME"),
            displayFolder: getPropertyValue(row, "MEASURE_DISPLAY_FOLDER"),
            defaultFormat: getPropertyValue(row, "DEFAULT_FORMAT_STRING")
        }); });
        return rows;
    }
    /**
     * @hidden
     */
    function parseKPIs(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            name: getPropertyValue(row, "KPI_NAME"),
            uniqueName: getPropertyValue(row, "KPI_NAME"),
            caption: getPropertyValue(row, "KPI_CAPTION"),
            value: getPropertyValue(row, "KPI_VALUE"),
            goal: getPropertyValue(row, "KPI_GOAL"),
            status: getPropertyValue(row, "KPI_STATUS"),
            trend: getPropertyValue(row, "KPI_TREND"),
            statusGraphic: getPropertyValue(row, "KPI_STATUS_GRAPHIC"),
            trendGraphic: getPropertyValue(row, "KPI_TREND_GRAPHIC"),
            description: getPropertyValue(row, "KPI_DESCRIPTION"),
            groupName: getPropertyValue(row, "MEASUREGROUP_NAME"),
            type: "kpi"
        }); });
        return rows;
    }
    /**
     * @hidden
     */
    function parseDimensions(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            caption: getPropertyValue(row, "DIMENSION_CAPTION"),
            defaultHierarchy: getPropertyValue(row, "DEFAULT_HIERARCHY"),
            description: getPropertyValue(row, "DESCRIPTION"),
            name: getPropertyValue(row, "DIMENSION_NAME"),
            type: parseInt(getPropertyValue(row, "DIMENSION_TYPE"), 10),
            uniqueName: getPropertyValue(row, "DIMENSION_UNIQUE_NAME")
        }); });
        return rows;
    }
    /**
     * @hidden
     */
    function parseHierarchies(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            name: getPropertyValue(row, "HIERARCHY_NAME"),
            caption: getPropertyValue(row, "HIERARCHY_CAPTION"),
            description: getPropertyValue(row, "DESCRIPTION"),
            uniqueName: getPropertyValue(row, "HIERARCHY_UNIQUE_NAME"),
            dimensionUniqueName: getPropertyValue(row, "DIMENSION_UNIQUE_NAME"),
            displayFolder: getPropertyValue(row, "HIERARCHY_DISPLAY_FOLDER"),
            origin: getPropertyValue(row, "HIERARCHY_ORIGIN"),
            defaultMember: getPropertyValue(row, "DEFAULT_MEMBER")
        }); });
        return rows;
    }
    /**
     * @hidden
     */
    function parseLevels(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            name: getPropertyValue(row, "LEVEL_NAME"),
            caption: getPropertyValue(row, "LEVEL_CAPTION"),
            description: getPropertyValue(row, "DESCRIPTION"),
            uniqueName: getPropertyValue(row, "LEVEL_UNIQUE_NAME"),
            dimensionUniqueName: getPropertyValue(row, "DIMENSION_UNIQUE_NAME"),
            displayFolder: getPropertyValue(row, "LEVEL_DISPLAY_FOLDER"),
            orderingProperty: getPropertyValue(row, "LEVEL_ORDERING_PROPERTY"),
            origin: getPropertyValue(row, "LEVEL_ORIGIN"),
            hierarchyUniqueName: getPropertyValue(row, "HIERARCHY_UNIQUE_NAME")
        }); });
        return rows;
    }
    /**
     * @hidden
     */
    function parseMembers(response) {
        var xmlDoc = new DOMParser().parseFromString(response, "text/xml");
        var rows = Array.from(xmlDoc.querySelectorAll("DiscoverResponse > return > root > row"))
            .map(function (row) { return ({
            name: getPropertyValue(row, "MEMBER_NAME"),
            caption: getPropertyValue(row, "MEMBER_CAPTION"),
            uniqueName: getPropertyValue(row, "MEMBER_UNIQUE_NAME"),
            dimensionUniqueName: getPropertyValue(row, "DIMENSION_UNIQUE_NAME"),
            hierarchyUniqueName: getPropertyValue(row, "HIERARCHY_UNIQUE_NAME"),
            levelUniqueName: getPropertyValue(row, "LEVEL_UNIQUE_NAME"),
            childrenCardinality: getPropertyValue(row, "CHILDREN_CARDINALITY")
        }); });
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
    /**
     * Fetches the data.
     *
     * @param options RequestOptions
     * @returns Promise<ResponseData>
     *
     * @example
     * const options: RequestOptions = { ... };
     *
     * fetchData(options).then(createDataState).then((dataState: DataState) => {
     *  // Update the UI
     * });
     */
    /**
     * @hidden
     */
    var fetchData = function (fetchOptions, options) { return __awaiter(void 0, void 0, void 0, function () {
        var init, response, stringResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    init = __assign({ body: createRequestBody(options), headers: { 'Content-Type': 'text/xml' }, method: 'POST' }, fetchOptions.init);
                    return [4 /*yield*/, fetch(fetchOptions.url, init)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    stringResponse = _a.sent();
                    return [2 /*return*/, parseResponse(stringResponse)];
            }
        });
    }); };
    /**
     * @hidden
     */
    var fetchDiscover = function (fetchOptions, options) { return __awaiter(void 0, void 0, void 0, function () {
        var init, response, stringResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    init = __assign({ body: createDiscoverBody(options), headers: { 'Content-Type': 'text/xml' }, method: 'POST' }, fetchOptions.init);
                    return [4 /*yield*/, fetch(fetchOptions.url, init)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    stringResponse = _a.sent();
                    return [2 /*return*/, discoverParser[options.command](stringResponse)];
            }
        });
    }); };

    /**
     * Creates the state object. See `fetchData`.
     *
     * @param response - ResponseData
     * @returns DataState
     */
    /**
     * @hidden
     */
    var createDataState = function (response) {
        var state = {
            columns: response.columns.tuples,
            data: response.data,
            rows: response.rows.tuples
        };
        return state;
    };

    /**
     * Creates a collection of AxisDescriptor base on the expandTree.
     * @param expandTree - { [key: string]: boolean }
     * @returns AxisDescriptor[]
     *
     * @example
     * See `setRowExpand` or `setColumnExpand` functions.
     */
    /**
     * @hidden
     */
    function createAxisDescriptors(expandTree) {
        var descriptors = [];
        for (var _i = 0, _a = Object.keys(expandTree); _i < _a.length; _i++) {
            var key = _a[_i];
            descriptors.push({ name: JSON.parse(key), expand: expandTree[key] });
        }
        return descriptors;
    }

    /**
     * Sets sort descriptors to request options.
     *
     * @param options - RequestOptions
     * @param sort - SortDescriptor[]
     *
     * @example
     * const options: RequestOptions = { ... };
     * const sort: SortDescriptor[] = [{ ... }, { ... }];
     * setSort(options, sort);
     * // skip the sort parameter to clear current filter - setSort(options);
     *
     * fetchData(options).then(createDataState).then((dataState: DataState) => {
     *  // Update the UI
     * });
     */
    /**
     * @hidden
     */
    var setSort = function (options, sort) {
        if (sort === void 0) { sort = []; }
        options.sort = sort;
    };

    /**
     * Sets filter descriptors to request options.
     *
     * @param options - RequestOptions
     * @param filter - FilterDescriptor[]
     *
     * @example
     * const options: RequestOptions = { ... };
     * const filter: FilterDescriptor[] = [{ ... }, { ... }];
     * setFilter(options, filter);
     * // skip the filter parameter to clear current filter - setFilter(options);
     *
     * fetchData(options).then(createDataState).then((dataState: DataState) => {
     *  // Update the UI
     * });
     */
    /**
     * @hidden
     */
    var setFilter = function (options, filter) {
        if (filter === void 0) { filter = []; }
        options.filter = filter;
    };

    // A typical tree depth count won't work for the Pivot,
    // as each branch can have lower number of nodes than the total number of levels
    /**
     * @hidden
     */
    var getMaxNesting = function (node, set) {
        if (set === void 0) { set = new Set(); }
        (node.children || []).forEach(function (child) {
            set.add(child.levelName);
            getMaxNesting(child, set);
        });
        return set.size;
    };
    /**
     * @hidden
     */
    var getMaxExpansion = function (node) {
        var expanded = 0;
        (node.children || []).forEach(function (child) {
            expanded += (getMaxExpansion(child) || 1);
        });
        return expanded;
    };
    /**
     * @hidden
     */
    var generateNormalizedPath = function (node, parent) {
        return (parent && (parent.hierarchy === node.hierarchy)
            ? __spreadArrays((parent.normalizedPath || []).slice(0, -1), [node.name || null]) : __spreadArrays(((parent && parent.normalizedPath) ? parent.normalizedPath : []), [node.name])).filter(Boolean);
    };
    /**
     * @hidden
     */
    var generatePath = function (node, parent) {
        return (parent && (parent.hierarchy === node.hierarchy)
            ? __spreadArrays((parent.path || []).slice(0, -1), [((node.levelNum === 0 ? node.hierarchy : node.name) || null)]) : __spreadArrays(((parent && parent.path) ? parent.path : []), [node.levelNum === 0 ? node.hierarchy : node.name])).filter(Boolean);
    };
    /**
     * @hidden
     */
    var toMatrix = function (node, rowIndex, colIndex, maxDepth, maxBreadth, matrix, leafs, parent) {
        if (rowIndex === void 0) { rowIndex = -1; }
        if (colIndex === void 0) { colIndex = 0; }
        if (maxDepth === void 0) { maxDepth = undefined; }
        if (maxBreadth === void 0) { maxBreadth = undefined; }
        if (matrix === void 0) { matrix = undefined; }
        if (leafs === void 0) { leafs = undefined; }
        if (parent === void 0) { parent = undefined; }
        var branchDepth = getMaxNesting(node);
        var branchBreadth = getMaxExpansion(node);
        var depth = maxDepth || branchDepth;
        var breadth = maxBreadth || branchBreadth;
        var matrixResult = matrix ? matrix.slice() : [];
        var leafsResult = leafs ? leafs.slice() : new Array(breadth);
        var index = matrixResult.findIndex(function (l) { return l && l.name === node.levelName && l.level === node.levelNum; });
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
            total: (node.total !== undefined ? node.total : false) || (parent && parent.children.length <= 1 && parent.total),
            parent: parent,
            rowIndex: rowIndex,
            colIndex: colIndex,
            depth: 1,
            breadth: 1,
            path: node.path || [],
            normalizedPath: node.normalizedPath || [],
            children: node.children.filter(function (c) { return c.hierarchy === node.hierarchy; })
        };
        if (inject) {
            if (level) {
                level.cells[colIndex] = cell;
                if (level.index >= rowIndex) {
                    rowIndex = level.index;
                }
            }
            else {
                if (matrixResult[rowIndex] && matrixResult[rowIndex].cells.length) {
                    for (var idx = rowIndex; idx < matrixResult.length; idx++) {
                        var shiftedRow = matrixResult[idx];
                        shiftedRow.index++;
                    }
                    matrixResult.splice(rowIndex, 0, row);
                    matrixResult[rowIndex].cells[colIndex] = cell;
                }
                else {
                    matrixResult[rowIndex] = row;
                    matrixResult[rowIndex].cells[colIndex] = cell;
                }
            }
        }
        var collOffset = 0;
        if (node.children && node.children.length) {
            node.children.forEach(function (child) {
                var _a = toMatrix(child, rowIndex + 1, colIndex + collOffset, depth, breadth, matrixResult, leafsResult, cell), newMatrix = _a[0], newLeafs = _a[1], childBreadth = _a[3];
                collOffset += (childBreadth || 1);
                matrixResult = newMatrix.slice();
                leafsResult = newLeafs.slice();
            });
        }
        else if (node.normalizedPath) {
            leafsResult[colIndex] = { total: cell.total, path: node.normalizedPath };
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
        if (parent === void 0) { parent = null; }
        if (index === void 0) { index = 0; }
        var hierarchy;
        var alt = __assign(__assign({}, root), { total: true, hasChildren: false, children: [] });
        for (var childIndex = 0; childIndex < root.children.length; childIndex++) {
            var child = withTotal(root.children[childIndex], root, childIndex);
            hierarchy = hierarchy || child.hierarchy;
            if (child.hierarchy !== hierarchy
                && parent
                && !parent.children.some(function (c) { return c.total && c.name === alt.name; })
                && !root.total) {
                alt.children.push(child);
                root.children.splice(childIndex, 1);
                childIndex--;
            }
        }
        if (root.children.filter(function (c) { return !c.total; }).length >= 1
            && parent
            && !parent.children.some(function (c) { return c.total && c.name === alt.name; })
            && !root.total) {
            var childHierarchy = root.children[0].hierarchy;
            if (root.hierarchy === childHierarchy) {
                parent.children.splice(index + 1, 0, alt);
            }
        }
        return root;
    };
    /**
     * @hidden
     */
    var toTree = function (tuples) {
        var root = { children: [] };
        var map = {};
        for (var tupleIndex = 0; tupleIndex < tuples.length; tupleIndex++) {
            var tuple = copy(tuples[tupleIndex]);
            var key = "";
            var _loop_1 = function (memberIndex) {
                var member = tuple.members[memberIndex];
                var parent_1;
                if (root.children && root.children.length === 0) {
                    parent_1 = root;
                }
                else if (map[key] && !map[key + member.name] && member.levelNum === 0) {
                    parent_1 = map[key];
                }
                else if (map[key + member.parentName] && member.levelNum > 0 && !map[key + member.parentName + member.name]) {
                    parent_1 = map[key + member.parentName];
                }
                else if (!map[key + member.parentName] && member.levelNum > 0 && !map[key + member.parentName + member.name]) {
                    var parentKey = Object.keys(map).find(function (e) { return member.parentName === map[e].name; });
                    if (parentKey) {
                        parent_1 = map[parentKey];
                    }
                }
                if (parent_1) {
                    member.path = generatePath(member, parent_1);
                    member.normalizedPath = generateNormalizedPath(member, parent_1);
                    var intruderIndex = parent_1.children.findIndex(function (c) { return c.hierarchy !== parent_1.hierarchy; });
                    if (intruderIndex !== -1) {
                        parent_1.children.splice(intruderIndex, 0, member);
                    }
                    else {
                        parent_1.children.push(member);
                    }
                }
                member.parentName += member.name;
                key += member.parentName;
                if (!map[key]) {
                    map[key] = member;
                }
            };
            for (var memberIndex = 0; memberIndex < tuple.members.length; memberIndex++) {
                _loop_1(memberIndex);
            }
        }
        return copy(withTotal(root));
    };
    /**
     * @hidden
     */
    var toData = function (data, columns, rows, breadth, depth) {
        var result = Array.from(new Array(depth), function () { return ({ cells: Array.from(new Array(breadth), function () { return null; }) }); });
        var hash = function (names) { return names.join('|'); };
        var membersNames = function (tuple) { return tuple.members.map(function (m) { return m.name; }); };
        var columnsIndexes = new Map();
        var rowsIndexes = new Map();
        columns.forEach(function (colMembers, idx) { columnsIndexes.set(hash(colMembers.path), idx); });
        rows.forEach(function (rowMembers, idx) { rowsIndexes.set(hash(rowMembers.path), idx); });
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
                        result[colIndex] = {
                            cells: new Array(depth).fill(null)
                        };
                    }
                    result[colIndex].cells[rowIndex] = __assign(__assign({}, cell), { rowSpan: cell.colSpan, colSpan: cell.rowSpan });
                }
            }
        }
        return [result, leafs, breadth, depth];
    };
    /**
     * @hidden
     */
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
        return [matrix, leafs, depth, breadth];
    };
    /**
     * @hidden
     */
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
    /**
     * @hidden
     */
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
    /**
     * @hidden
     */
    function buildKPIMeasures(node) {
        var name = node.name;
        return [
            kpiMeasure(name, node.value, "value"),
            kpiMeasure(name, node.goal, "goal"),
            kpiMeasure(name, node.status, "status"),
            kpiMeasure(name, node.trend, "trend")
        ];
    }
    /**
     * @hidden
     */
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
                caption: "KPIs",
                defaultHierarchy: "[KPIs]",
                name: "KPIs",
                uniqueName: "[KPIs]"
            });
        }
    };
    /**
     * @hidden
     */
    var compareAxisWithField = function (a, b) { return String(a.name) === String([(b.defaultHierarchy
            ? b.defaultHierarchy
            : b.uniqueName)]); };
    /**
     * @hidden
     */
    var compareAxes = function (a, b) { return String(a.name) === String(b.name); };
    /**
     * @hidden
     */
    var filterField = function (axes, out) {
        var _loop_2 = function (i) {
            var axis = axes[i];
            var index = axis.name.findIndex(function (name) { return compareAxisWithField({ name: [name] }, out) || String(name).startsWith(out.uniqueName); });
            if (index !== -1) {
                if (index === axis.name.length - 1 || axis.name.length === 1) {
                    axes.splice(i, 1);
                }
                else {
                    axis.name.splice(index, 1);
                    var duplicatedAxisIndex = axes.findIndex(function (ax) { return ax !== axis && String(ax.name) === String(axis.name); });
                    if (duplicatedAxisIndex !== -1) {
                        axes[duplicatedAxisIndex] = __assign(__assign(__assign({}, axes[duplicatedAxisIndex]), axis), ((axes[duplicatedAxisIndex].expand || axis.expand) ? { expand: true } : {}));
                        axes.splice(i, 1);
                    }
                }
            }
        };
        for (var i = axes.length - 1; i >= 0; i--) {
            _loop_2(i);
        }
    };
    /**
     * @hidden
     */
    var insertAxis = function (axes, toInsert, state) {
        var index = -1;
        if (state.dropTarget && state.dropDirection) {
            var offset = state.dropDirection
                ? (state.dropDirection === 'before'
                    ? 0
                    : 1)
                : 0;
            index = axes.findIndex(function (c) { return compareAxes(c, state.dropTarget); }) + offset;
        }
        if (index !== -1) {
            axes.forEach(function (axis) {
                var _a;
                if (axis.expand && axis.name.length > 1 && axis.name.length > index) {
                    (_a = axis.name).splice.apply(_a, __spreadArrays([index, 0], toInsert.name));
                }
            });
            axes.splice(index, 0, toInsert);
        }
        else {
            axes.push(toInsert);
        }
    };

    /**
     * @hidden
     */
    exports.HEADERS_ACTION = void 0;
    (function (HEADERS_ACTION) {
        HEADERS_ACTION["toggle"] = "HEADERS_ACTION_TOGGLE";
        HEADERS_ACTION["expand"] = "HEADERS_ACTION_EXPAND";
        HEADERS_ACTION["collapse"] = "HEADERS_ACTION_COLLAPSE";
    })(exports.HEADERS_ACTION || (exports.HEADERS_ACTION = {}));
    var findPath = function (node, matchFn, matched) {
        var result = new Set();
        node.children.forEach(function (child) {
            var match = matchFn(child);
            if (matched) {
                result.add(String(child.path));
            }
            findPath(child, matchFn, (matched || match)).map(function (h) {
                result.add(h);
            });
        });
        return Array.from(result.values());
    };
    /**
     * @hidden
     */
    var headersReducer = function (state, action) {
        switch (action.type) {
            case exports.HEADERS_ACTION.toggle: {
                var existing = state.find((function (s) { return String(s.name) === String(action.payload); }));
                return headersReducer(state, __assign(__assign({}, action), { type: existing && (existing.expand)
                        ? exports.HEADERS_ACTION.collapse
                        : exports.HEADERS_ACTION.expand }));
            }
            case exports.HEADERS_ACTION.expand: {
                var existing_1 = state.find((function (s) { return String(s.name) === String(action.payload); }));
                if (existing_1 && existing_1.expand === true) {
                    return state;
                }
                else if (existing_1 && (existing_1.expand === false || existing_1.expand === undefined)) {
                    return state.map(function (s) { return s === existing_1 ? (__assign(__assign({}, existing_1), { expand: true })) : s; });
                }
                else {
                    var nextState = state.slice();
                    nextState.push({ name: action.payload, expand: true });
                    return nextState;
                }
            }
            case exports.HEADERS_ACTION.collapse: {
                var filtered_1 = findPath(action.tree, function (node) { return !node.total && String(node.path) === String(action.payload); });
                var newState = state.slice()
                    .filter(function (h) { return !filtered_1.some(function (f) { return f === String(h.name); }); })
                    .map(function (h) { return (__assign(__assign({}, h), { expand: Boolean(h.expand) })); })
                    .map(function (h) { return (String(h.name) === String(action.payload))
                    ? action.payload.length > 1 ? undefined : { name: action.payload, expand: false }
                    : h; })
                    .filter(Boolean);
                return newState;
            }
            default: {
                return state;
            }
        }
    };

    /**
     * @hidden
     */
    exports.PIVOT_CONFIGURATOR_ACTION = void 0;
    (function (PIVOT_CONFIGURATOR_ACTION) {
        // Selection
        PIVOT_CONFIGURATOR_ACTION["toggleSelection"] = "PIVOT_CONFIGURATOR_ACTION_TOGGLE_SELECTION";
        PIVOT_CONFIGURATOR_ACTION["addColumnAxis"] = "PIVOT_CONFIGURATOR_ACTION_ADD_COLUMN_AXIS";
        PIVOT_CONFIGURATOR_ACTION["addColumnAxes"] = "PIVOT_CONFIGURATOR_ACTION_ADD_COLUMN_AXES";
        PIVOT_CONFIGURATOR_ACTION["removeColumnAxis"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE_COLUMN_AXIS";
        PIVOT_CONFIGURATOR_ACTION["removeColumnAxes"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE_COLUMN_AXES";
        PIVOT_CONFIGURATOR_ACTION["addRowAxis"] = "PIVOT_CONFIGURATOR_ACTION_ADD_ROW_AXIS";
        PIVOT_CONFIGURATOR_ACTION["addRowAxes"] = "PIVOT_CONFIGURATOR_ACTION_ADD_ROW_AXES";
        PIVOT_CONFIGURATOR_ACTION["removeRowAxis"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE_ROW_AXIS";
        PIVOT_CONFIGURATOR_ACTION["removeRowAxes"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE_ROW_AXES";
        PIVOT_CONFIGURATOR_ACTION["addMeasureAxis"] = "PIVOT_CONFIGURATOR_ACTION_ADD_MEASURE_AXIS";
        PIVOT_CONFIGURATOR_ACTION["addMeasureAxes"] = "PIVOT_CONFIGURATOR_ACTION_ADD_MEASURE_AXES";
        PIVOT_CONFIGURATOR_ACTION["removeMeasureAxis"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE_MEASURE_AXIS";
        PIVOT_CONFIGURATOR_ACTION["removeMeasureAxes"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE_MEASURE_AXES";
        // Removal
        PIVOT_CONFIGURATOR_ACTION["remove"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE";
        // Sort
        PIVOT_CONFIGURATOR_ACTION["setSort"] = "PIVOT_CONFIGURATOR_ACTION_SET_SORT";
        // Filter
        PIVOT_CONFIGURATOR_ACTION["setFilter"] = "PIVOT_CONFIGURATOR_ACTION_SET_FILTER";
        PIVOT_CONFIGURATOR_ACTION["addFilter"] = "PIVOT_CONFIGURATOR_ACTION_ADD_FILTER";
        PIVOT_CONFIGURATOR_ACTION["changeFilter"] = "PIVOT_CONFIGURATOR_ACTION_CHANGE_FILTER";
        PIVOT_CONFIGURATOR_ACTION["removeFilter"] = "PIVOT_CONFIGURATOR_ACTION_REMOVE_FILTER";
        // Drag
        PIVOT_CONFIGURATOR_ACTION["setDragItem"] = "PIVOT_CONFIGURATOR_ACTION_SET_DRAGITEM";
        PIVOT_CONFIGURATOR_ACTION["drop"] = "PIVOT_CONFIGURATOR_ACTION_DROP";
        PIVOT_CONFIGURATOR_ACTION["setDropZone"] = "PIVOT_CONFIGURATOR_ACTION_SET_DROP_ZONE";
        PIVOT_CONFIGURATOR_ACTION["setDropTarget"] = "PIVOT_CONFIGURATOR_ACTION_SET_DROP_TARGET";
        PIVOT_CONFIGURATOR_ACTION["setDropDirection"] = "PIVOT_CONFIGURATOR_ACTION_SET_DROP_DIRECTION";
    })(exports.PIVOT_CONFIGURATOR_ACTION || (exports.PIVOT_CONFIGURATOR_ACTION = {}));
    /**
     * @hidden
     */
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
                if (Array.isArray(action.payload)) ;
                else {
                    var payload_1 = action.payload;
                    if (payload_1.type === 2 || 'aggregator' in payload_1) {
                        if (state.measureAxes.some(function (s) { return compareAxisWithField(s, payload_1); })) {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxis }));
                        }
                        else {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxis }));
                        }
                    }
                    else if (payload_1.type === 'kpi') {
                        var measures = buildKPIMeasures(payload_1);
                        if (measures.every(function (m) { return state.measureAxes.some(function (s) { return compareAxisWithField(s, m); }); })) {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxes, payload: measures }));
                        }
                        else {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxes, payload: measures.filter(function (m) { return !state.measureAxes.some(function (s) { return compareAxisWithField(s, m); }); }) }));
                        }
                    }
                    else if (action.payload.kpi) {
                        if (state.measureAxes.some(function (s) { return compareAxisWithField(s, payload_1); })) {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxis }));
                        }
                        else {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxis }));
                        }
                    }
                    else {
                        if (state.columnAxes.some(function (s) { return compareAxisWithField(s, payload_1); })) {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeColumnAxis }));
                        }
                        else if (state.rowAxes.some(function (s) { return compareAxisWithField(s, payload_1); })) {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.removeRowAxis }));
                        }
                        else if ((state.columnAxes && state.columnAxes.length) && (!state.rowAxes || !state.rowAxes.length)) {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addRowAxis }));
                        }
                        else {
                            return configuratorReducer(state, __assign(__assign({}, action), { type: exports.PIVOT_CONFIGURATOR_ACTION.addColumnAxis }));
                        }
                    }
                }
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.addColumnAxis: {
                newColumns = __spreadArrays((state.columnAxes || []), [
                    { name: [action.payload.defaultHierarchy || action.payload.uniqueName] }
                ]);
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.addColumnAxes: {
                // TODO;
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.removeColumnAxis: {
                newColumns = __spreadArrays((state.columnAxes || []).filter(function (s) { return !compareAxisWithField(s, action.payload); }));
                filterField(newColumns, action.payload);
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.removeColumnAxes: {
                // TODO;
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.addRowAxis: {
                newRows = __spreadArrays((state.rowAxes || []), [
                    { name: [action.payload.defaultHierarchy || action.payload.uniqueName] }
                ]);
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.addRowAxes: {
                // TODO;
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.removeRowAxis: {
                newRows = __spreadArrays((state.rowAxes || []).filter(function (s) { return !compareAxisWithField(s, action.payload); }));
                filterField(newRows, action.payload);
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.removeRowAxes: {
                // TODO;
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxis: {
                newMeasures = __spreadArrays((state.measureAxes || []), [
                    { name: [action.payload.defaultHierarchy || action.payload.uniqueName] }
                ]);
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxis: {
                newMeasures = __spreadArrays((state.measureAxes || []).filter(function (s) { return !compareAxisWithField(s, action.payload); }));
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.addMeasureAxes: {
                newMeasures = __spreadArrays((state.measureAxes || []), (action.payload || []).map(function (p) { return ({ name: [p.defaultHierarchy || p.uniqueName] }); }));
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.removeMeasureAxes: {
                newMeasures = __spreadArrays((state.measureAxes || []).filter(function (s) { return !action.payload.some(function (p) { return compareAxisWithField(s, p); }); }));
                break;
            }
            case exports.PIVOT_CONFIGURATOR_ACTION.remove: {
                if (state.columnAxes.some(function (s) { return compareAxes(s, action.payload); })) {
                    newColumns = __spreadArrays(state.columnAxes.filter(function (s) { return !compareAxes(s, action.payload); }));
                    filterField(newColumns, { uniqueName: action.payload.name });
                }
                if (state.rowAxes.some(function (s) { return compareAxes(s, action.payload); })) {
                    newRows = __spreadArrays(state.rowAxes.filter(function (s) { return !compareAxes(s, action.payload); }));
                    filterField(newRows, { uniqueName: action.payload.name });
                }
                if (state.measureAxes.some(function (s) { return compareAxes(s, action.payload); })) {
                    newMeasures = __spreadArrays(state.measureAxes.filter(function (s) { return !compareAxes(s, action.payload); }));
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
                    var currentColumn = state.columnAxes.find(function (s) { return compareAxes(s, action.payload); });
                    var currentRow = state.rowAxes.find(function (s) { return compareAxes(s, action.payload); });
                    var currentMeasure = state.measureAxes.find(function (s) { return compareAxes(s, action.payload); });
                    var current = void 0;
                    if (currentColumn) {
                        current = currentColumn;
                        newColumns = __spreadArrays(state.columnAxes.filter(function (s) { return !compareAxes(s, action.payload); }));
                        filterField(newColumns, { uniqueName: action.payload.name });
                    }
                    if (currentRow) {
                        current = currentRow;
                        newRows = __spreadArrays(state.rowAxes.filter(function (s) { return !compareAxes(s, action.payload); }));
                        filterField(newRows, { uniqueName: action.payload.name });
                    }
                    if (currentMeasure) {
                        current = currentMeasure;
                        newMeasures = __spreadArrays(state.measureAxes.filter(function (s) { return !compareAxes(s, action.payload); }));
                    }
                    switch (state.dropZone) {
                        case 'columnAxes': {
                            newColumns = newColumns || state.columnAxes.slice();
                            insertAxis(newColumns, current, state);
                            break;
                        }
                        case 'rowAxes': {
                            newRows = newRows || state.rowAxes.slice();
                            insertAxis(newRows, current, state);
                            break;
                        }
                        case 'measureAxes': {
                            newMeasures = newMeasures || state.measureAxes.slice();
                            insertAxis(newMeasures, current, state);
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
                }
                else {
                    newFilter = [action.payload];
                }
                break;
            case exports.PIVOT_CONFIGURATOR_ACTION.addFilter:
                newFilter = (state.filter || []).slice();
                if (Array.isArray(action.payload)) {
                    newFilter.push.apply(newFilter, action.payload);
                }
                else {
                    newFilter.push(action.payload);
                }
                break;
            case exports.PIVOT_CONFIGURATOR_ACTION.changeFilter:
                newFilter = (Array.isArray(action.payload)
                    ? (state.filter || []).map(function (f) { return action.payload.some(function (a) { return a.field === f.field; })
                        ? action.payload.find(function (a) { return a.field === f.field; })
                        : f; })
                    : (state.filter || []).map(function (f) { return f.field === action.payload.field
                        ? action.payload
                        : f; }));
                break;
            case exports.PIVOT_CONFIGURATOR_ACTION.removeFilter:
                newFilter = (state.filter || []).slice();
                if (Array.isArray(action.payload)) {
                    newFilter = newFilter.filter(function (f) { return !action.payload.some(function (p) { return p.field === f.field &&
                        p.operator === f.operator; }); });
                }
                else {
                    newFilter = newFilter.filter(function (f) { return !(f.field === action.payload.field
                        && f.operator === action.payload.operator); });
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

    // tslint:disable:object-literal-sort-keys
    /**
     * Represents the aggregate object which calculates the total value. Applicable for local data binding.
     */
    var sumAggregate = {
        init: function (data) {
            if (('sum' in data) === false) {
                data.sum = 0;
            }
        },
        merge: function (src, dest) {
            dest.sum += src.sum;
        },
        accumulate: function (acc, value) {
            acc.sum += value;
        },
        result: function (data) { return data.sum; },
        format: function (value) { return value.toFixed(2); }
    };
    /**
     * Represents the aggregate object which calculates the minimum value. Applicable for local data binding.
     */
    var minAggregate = {
        init: function (data) {
            if (('min' in data) === false) {
                data.min = Number.POSITIVE_INFINITY;
            }
        },
        merge: function (src, dest) {
            dest.min = Math.min(src.min, dest.min);
        },
        accumulate: function (acc, value) {
            acc.min = Math.min(value, acc.min);
        },
        result: function (data) { return Number.isFinite(data.min) ? data.min : NaN; },
        format: function (value) { return value.toFixed(2); }
    };
    /**
     * Represents the aggregate object which calculates the maximum value. Applicable for local data binding.
     */
    var maxAggregate = {
        init: function (data) {
            if (('max' in data) === false) {
                data.max = Number.NEGATIVE_INFINITY;
            }
        },
        merge: function (src, dest) {
            dest.max = Math.max(src.max, dest.max);
        },
        accumulate: function (acc, value) {
            acc.max = Math.max(value, acc.max);
        },
        result: function (data) { return Number.isFinite(data.max) ? data.max : NaN; },
        format: function (value) { return value.toFixed(2); }
    };
    /**
     * Represents the aggregate object which calculates the average value. Applicable for local data binding.
     */
    var averageAggregate = {
        init: function (data) {
            if (('count' in data) === false) {
                data.sumA = 0;
                data.count = 0;
            }
        },
        merge: function (src, dest) {
            dest.sumA += src.sumA;
            dest.count += src.count;
        },
        accumulate: function (acc, value) {
            acc.sumA += value;
            acc.count += 1;
        },
        result: function (data) { return data.sumA / data.count; },
        format: function (value) { return value.toFixed(2); }
    };

    /**
     * @hidden
     */
    var isPresent = function (value) { return value !== null && value !== undefined; };
    /**
     * @hidden
     */
    var isBlank = function (value) { return value === null || value === undefined; };
    /**
     * @hidden
     */
    var isArray = function (value) { return Array.isArray(value); };
    /**
     * @hidden
     */
    var isFunction = function (value) { return typeof value === 'function'; };
    /**
     * @hidden
     */
    var isString = function (value) { return typeof value === 'string'; };
    /**
     * @hidden
     */
    var isNullOrEmptyString = function (value) { return isBlank(value) || value.trim().length === 0; };
    /**
     * @hidden
     */
    var isNotNullOrEmptyString = function (value) { return !isNullOrEmptyString(value); };
    /**
     * @hidden
     */
    var isNumeric = function (value) { return !isNaN(value - parseFloat(value)); };
    /**
     * @hidden
     */
    var isDate = function (value) { return value && value.getTime; };

    // tslint:enable:max-line-length
    /**
     * @hidden
     * Type guard for `CompositeFilterDescriptor`.
     */
    var isCompositeFilterDescriptor = function (source) {
        return isPresent(source.filters);
    };

    /**
     * @hidden
     */
    var ifElse = function (predicate, right, left) { return function (value) { return predicate(value) ? right(value) : left(value); }; };
    /**
     * @hidden
     * Performs the right-to-left function composition. Functions should have a unary.
     */
    var compose = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return function (data) { return args.reduceRight(function (acc, curr) { return curr(acc); }, data); };
    };

    /**
     * @hidden
     */
    var toUTC = function (date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    };
    /**
     * @hidden
     */
    var isDateValue = function (x) { return isDate(x.value); };

    var getterCache = {};
    var FIELD_REGEX = /\[(?:(\d+)|['"](.*?)['"])\]|((?:(?!\[.*?\]|\.).)+)/g;
    // tslint:disable-next-line:no-string-literal
    getterCache['undefined'] = function (obj) { return obj; };
    /**
     * @hidden
     */
    var getter = function (field, safe) {
        var key = field + safe;
        if (getterCache[key]) {
            return getterCache[key];
        }
        var fields = [];
        field.replace(FIELD_REGEX, function (_, index, indexAccessor, field) {
            fields.push(isPresent(index) ? index : (indexAccessor || field));
            return undefined;
        });
        getterCache[key] = function (obj) {
            var result = obj;
            for (var idx = 0; idx < fields.length; idx++) {
                result = result[fields[idx]];
                if (!isPresent(result) && safe) {
                    return result;
                }
            }
            return result;
        };
        return getterCache[key];
    };

    var pairwise = function (key) { return function (value) { return [key, value]; }; };
    var empty = function () { return null; };
    var isNotEmptyArray = function (value) { return isPresent(value) && isArray(value) && value.length > 0; };
    var isNotEmpty = function (accessor) { return function (value) { return isNotEmptyArray(accessor(value)); }; };
    var runOrEmpty = function (predicate, fn) { return ifElse(predicate, fn, empty); };
    var calcPage = function (_a) {
        var skip = _a.skip, take = _a.take;
        return Math.floor((skip || 0) / take) + 1;
    };
    var formatDescriptors = function (accessor, formatter) { return function (state) { return (accessor(state).map(formatter).join("~")); }; };
    var removeAfter = function (what) { return function (str) { return str.slice(0, str.indexOf(what)); }; };
    var replace = function (patterns) {
        return compose.apply(void 0, patterns.map(function (_a) {
            var left = _a[0], right = _a[1];
            return function (s) { return s.replace(new RegExp(left, "g"), right); };
        }));
    };
    var sanitizeDateLiterals = replace([["\"", ""], [":", "-"]]);
    var removeAfterDot = removeAfter(".");
    var directionFormatter = function (_a) {
        var field = _a.field, _b = _a.dir, dir = _b === void 0 ? "asc" : _b;
        return field + "-" + dir;
    };
    var aggregateFormatter = function (_a) {
        var field = _a.field, aggregate = _a.aggregate;
        return field + "-" + aggregate;
    };
    var take = getter("take");
    var aggregates = getter("aggregates");
    getter("skip");
    var group = getter("group");
    var sort = getter("sort", true);
    var formatSort = formatDescriptors(sort, directionFormatter);
    var formatGroup = formatDescriptors(group, directionFormatter);
    var formatAggregates = formatDescriptors(aggregates, aggregateFormatter);
    var prefixDateValue = function (value) { return "datetime'" + value + "'"; };
    var formatDateValue = compose(prefixDateValue, removeAfterDot, sanitizeDateLiterals, JSON.stringify, toUTC);
    var formatDate = function (_a) {
        var field = _a.field, value = _a.value, ignoreCase = _a.ignoreCase, operator = _a.operator;
        return ({
            value: formatDateValue(value),
            field: field,
            ignoreCase: ignoreCase,
            operator: operator
        });
    };
    var normalizeSort = function (state) { return Object.assign({}, state, {
        sort: (sort(state) || []).filter(function (_a) {
            var dir = _a.dir;
            return isNotNullOrEmptyString(dir);
        })
    }); };
    compose(pairwise('page'), calcPage);
    compose(pairwise('pageSize'), take);
    compose(pairwise('group'), formatGroup);
    var transformSort = compose(pairwise('sort'), formatSort);
    compose(pairwise('aggregate'), formatAggregates);
    compose(runOrEmpty(isNotEmpty(sort), transformSort), normalizeSort);
    var filterFormatter = function (_a) {
        var field = _a.field, operator = _a.operator, value = _a.value;
        return field + "~" + operator + "~" + value;
    };
    ifElse(isDateValue, compose(filterFormatter, formatDate), filterFormatter);

    // tslint:enable:max-line-length
    var set = function (field, target, value) {
        target[field] = value;
        return target;
    };
    var convert = function (mapper) { return function (values) { return Object.keys(values).reduce(mapper.bind(null, values), {}); }; };
    var translateAggregate = convert(function (source, acc, field) { return set(field.toLowerCase(), acc, source[field]); });
    var translateAggregates = convert(function (source, acc, field) { return set(field, acc, translateAggregate(source[field])); });
    var valueOrDefault = function (value, defaultValue) { return isPresent(value) ? value : defaultValue; };
    var normalizeGroup = function (group) { return ({
        aggregates: group.Aggregates || group.aggregates,
        field: group.Member || group.member || group.field,
        hasSubgroups: group.HasSubgroups || group.hasSubgroups || false,
        items: group.Items || group.items,
        value: valueOrDefault(group.Key, valueOrDefault(group.key, group.value))
    }); };
    var translateGroup = compose(function (_a) {
        var field = _a.field, hasSubgroups = _a.hasSubgroups, value = _a.value, aggregates = _a.aggregates, items = _a.items;
        return ({
            aggregates: translateAggregates(aggregates),
            field: field,
            items: hasSubgroups ? items.map(translateGroup) : items,
            value: value
        });
    }, normalizeGroup);

    var logic = {
        "or": {
            concat: function (acc, fn) { return function (a) { return acc(a) || fn(a); }; },
            identity: function () { return false; }
        },
        "and": {
            concat: function (acc, fn) { return function (a) { return acc(a) && fn(a); }; },
            identity: function () { return true; }
        }
    };
    var operatorsMap = {
        contains: function (a, b) { return (a || "").indexOf(b) >= 0; },
        doesnotcontain: function (a, b) { return (a || "").indexOf(b) === -1; },
        doesnotendwith: function (a, b) { return (a || "").indexOf(b, (a || "").length - (b || "").length) < 0; },
        doesnotstartwith: function (a, b) { return (a || "").lastIndexOf(b, 0) === -1; },
        endswith: function (a, b) { return (a || "").indexOf(b, (a || "").length - (b || "").length) >= 0; },
        eq: function (a, b) { return a === b; },
        gt: function (a, b) { return a > b; },
        gte: function (a, b) { return a >= b; },
        isempty: function (a) { return a === ''; },
        isnotempty: function (a) { return a !== ''; },
        isnotnull: function (a) { return isPresent(a); },
        isnull: function (a) { return isBlank(a); },
        lt: function (a, b) { return a < b; },
        lte: function (a, b) { return a <= b; },
        neq: function (a, b) { return a != b; },
        startswith: function (a, b) { return (a || "").lastIndexOf(b, 0) === 0; }
    };
    var dateRegExp = /^\/Date\((.*?)\)\/$/;
    var convertValue = function (value, ignoreCase) {
        if (value != null && isString(value)) {
            var date = dateRegExp.exec(value);
            if (date) {
                return new Date(+date[1]).getTime();
            }
            else if (ignoreCase) {
                return value.toLowerCase();
            }
        }
        else if (value != null && isDate(value)) {
            return value.getTime();
        }
        return value;
    };
    var typedGetter = function (prop, value, ignoreCase) {
        if (!isPresent(value)) {
            return prop;
        }
        var acc = prop;
        if (isString(value)) {
            var date = dateRegExp.exec(value);
            if (date) {
                value = new Date(+date[1]);
            }
            else {
                acc = function (a) {
                    var x = prop(a);
                    if (typeof x === 'string' && ignoreCase) {
                        return x.toLowerCase();
                    }
                    else {
                        return isNumeric(x) ? x + "" : x;
                    }
                };
            }
        }
        if (isDate(value)) {
            return function (a) {
                var x = acc(a);
                return isDate(x) ? x.getTime() : x;
            };
        }
        return acc;
    };
    var transformFilter = function (_a) {
        var field = _a.field, ignoreCase = _a.ignoreCase, value = _a.value, operator = _a.operator;
        field = !isPresent(field) ? function (a) { return a; } : field;
        ignoreCase = isPresent(ignoreCase) ? ignoreCase : true;
        var itemProp = typedGetter(isFunction(field) ? field : getter(field, true), value, ignoreCase);
        value = convertValue(value, ignoreCase);
        var op = isFunction(operator) ? operator : operatorsMap[operator];
        return function (a) { return op(itemProp(a), value, ignoreCase); };
    };
    /**
     * @hidden
     */
    var transformCompositeFilter = function (filter) {
        var combiner = logic[filter.logic];
        return filter.filters
            .filter(isPresent)
            .map(function (x) { return isCompositeFilterDescriptor(x) ? transformCompositeFilter(x) : transformFilter(x); })
            .reduce(combiner.concat, combiner.identity);
    };

    // tslint:disable:max-line-length
    /**
     * Creates a [Predicate]({% slug api_kendo-data-query_predicate %}) function for the specified [CompositeFilterDescriptor]({% slug api_kendo-data-query_compositefilterdescriptor %}).
     *
     * @param {CompositeFilterDescriptor} descriptor - The descriptor for which the predicate is created.
     * @returns {Predicate} - The created function instance.
     *
     * @example
     * ```ts
     * import { compileFilter } from '@progress/kendo-data-query';
     *
     * const data = [{ name: "Pork" }, { name: "Pepper" }, { name: "Beef" } ];
     * const predicate = compileFilter({ logic: "and", filters: [{ field: "name", operator: "startswith", value: "P" }] });
     * const result = data.filter(predicate);
     *
     * ```
     */
    // tslint:enable:max-line-length
    var compileFilter = function (descriptor) {
        if (!descriptor || descriptor.filters.length === 0) {
            return function () { return true; };
        }
        return transformCompositeFilter(descriptor);
    };

    function forEachDesc(desc, callbackfn) {
        if ('filters' in desc) {
            desc.filters.map(function (child) { return forEachDesc(child, callbackfn); });
        }
        else {
            callbackfn(desc);
        }
    }
    var filterFields = function (filter, callback) {
        var descriptors = Array.isArray(filter) ? filter : filter.filters;
        descriptors.forEach(function (desc) { return forEachDesc(desc, callback); });
    };
    /** @hidden */
    var initializeFiltering = function (rows, columns, filter) {
        var compositeFilter = filter ?
            (Array.isArray(filter) ? { logic: 'and', filters: filter } : filter) : undefined;
        var predicate = compositeFilter ? compileFilter(compositeFilter) : function () { return true; };
        var axes = rows.concat(columns);
        var fieldValues = [];
        filterFields(filter || [], function (desc) {
            if ('field' in desc && desc.field) {
                fieldValues.push(desc.field);
            }
        });
        var result = { hasFilter: false, predicate: predicate, filteringAxes: [] };
        if (fieldValues.some(function (f) { return typeof f === 'function'; })) {
            result.filteringAxes = axes.slice();
        }
        else if (fieldValues.length > 0) {
            var filteringFields_1 = Array.from(new Set(fieldValues).values());
            var filteringAxes = axes.filter(function (a) { return filteringFields_1.indexOf(a.key) >= 0; });
            result.filteringAxes = filteringAxes;
        }
        result.hasFilter = result.filteringAxes.length > 0;
        return result;
    };

    /** @hidden */
    var subNode = function (node, field, initialNode) {
        var childNode = node.get(field);
        if (!childNode) {
            childNode = initialNode || new Map();
            node.set(field, childNode);
        }
        return childNode;
    };
    var separator = '&';
    /** @hidden */
    var createKey = function (key, value) { return key + separator + value; };
    /** @hidden */
    var splitKeyValue = function (keyValue) {
        var separatorIndex = keyValue.indexOf(separator);
        if (separatorIndex !== -1) {
            var key = keyValue.substring(0, separatorIndex);
            var value = keyValue.substring(separatorIndex + 1);
            return [key, value];
        }
        else {
            return [keyValue, undefined];
        }
    };

    var calculateColumnData = function (node, measures, dataField) {
        node.forEach(function (childNode, k) {
            if (k !== dataField) {
                if (childNode.size > 0) {
                    calculateColumnData(childNode, measures, dataField);
                }
                var childData_1 = childNode.get(dataField);
                var parentData_1 = subNode(node, dataField, {});
                measures.forEach(function (m) {
                    m.aggregate.init(parentData_1);
                    m.aggregate.merge(childData_1, parentData_1);
                });
            }
        });
    };
    /** @hidden */
    var mergeTrees = function (src, dest, measures, dataField) {
        src.forEach(function (srcChild, k) {
            var destChild;
            if (k !== dataField) {
                destChild = subNode(dest, k);
                mergeTrees(srcChild, destChild, measures, dataField);
            }
            else {
                destChild = subNode(dest, k, {});
                measures.forEach(function (m) {
                    m.aggregate.init(destChild);
                    m.aggregate.merge(srcChild, destChild);
                });
            }
        });
    };
    var calculateColumns = function (node, measures, columnsData, dataField) {
        node.forEach(function (childNode, k) {
            if (k !== columnsData) {
                if (childNode.size > 0) {
                    calculateColumns(childNode, measures, columnsData, dataField);
                }
                var srcColumns = subNode(childNode, columnsData);
                var destColumns = subNode(node, columnsData);
                mergeTrees(srcColumns, destColumns, measures, dataField);
            }
        });
    };
    /** @hidden */
    var createDataTree = function (data, rows, columns, measures, fields, filter) {
        var result = new Map();
        var cache = new Map();
        var axes = rows.concat(columns);
        var leafNodes = new Set();
        var dataField = fields.dataField, columnsData = fields.columnsData;
        var _a = initializeFiltering(rows, columns, filter), hasFilter = _a.hasFilter, predicate = _a.predicate, filteringAxes = _a.filteringAxes;
        var empty = '';
        data.forEach(function (dataItem) {
            if (hasFilter) {
                var filteringDataItem_1 = {};
                filteringAxes.forEach(function (axis) { filteringDataItem_1[axis.key] = axis.displayValue(dataItem); });
                if (!predicate(filteringDataItem_1)) {
                    return;
                }
            }
            var values = axes.map(function (a) { return a.displayValue(dataItem); });
            var dataKey = empty.concat.apply(empty, values);
            var nodeData = cache.get(dataKey);
            if (!nodeData) {
                var node_1 = result;
                var eachAxis = function (axis) {
                    node_1 = subNode(node_1, createKey(axis.key, axis.displayValue(dataItem)));
                };
                rows.forEach(eachAxis);
                node_1 = subNode(node_1, columnsData);
                leafNodes.add(node_1);
                columns.forEach(eachAxis);
                nodeData = {};
                node_1.set(dataField, nodeData);
                cache.set(dataKey, nodeData);
                measures.forEach(function (m) {
                    m.aggregate.init(nodeData);
                });
            }
            measures.forEach(function (m) {
                m.aggregate.accumulate(nodeData, m.value(dataItem));
            });
        });
        leafNodes.forEach(function (leaf) { return calculateColumnData(leaf, measures, dataField); });
        calculateColumns(result, measures, columnsData, dataField);
        return result;
    };
    /** @hidden */
    var cloneDataTree = function (dataTree, dataField, measures) {
        var result = new Map();
        mergeTrees(dataTree, result, measures, dataField);
        return result;
    };

    var createPath = function (name, axes, path) {
        var _a = splitKeyValue(name), key = _a[0], value = _a[1];
        var result = path.slice();
        if (key && value) {
            var axis = axes.find(function (a) { return a.key === key; });
            var caption_1 = axis ? axis.caption : '';
            return result.map(function (p) { return p === caption_1 ? name : p; });
        }
        return result;
    };
    var membersNode = function (tree, members, field, axisSettings, measures, dataField, cache) {
        var cacheData = cache || new Map();
        var path = axisSettings.map(function (a) { return a.caption; });
        while (members.length > 1 && axisSettings.some(function (a) { return a.caption === members[members.length - 1].caption; })) {
            members.pop();
            path.pop();
        }
        var node = tree;
        members.forEach(function (m, i) {
            path = createPath(m.name, axisSettings, path);
            if (node && !axisSettings.some(function (a) { return a.caption === m.name; })) {
                if (!node.has(m.name) && !cacheData.has(path.slice(0, path.indexOf(m.name) + 1).join('-'))) {
                    var currentLevel = Array.from(node).find(function (n) { return n[0] !== field; });
                    var currentLevelNode = currentLevel && currentLevel[0];
                    var levelField_1 = currentLevelNode && splitKeyValue(currentLevelNode)[0];
                    var depth = levelField_1 ? i - axisSettings.findIndex(function (a) { return a.key === levelField_1; }) : 0;
                    var _loop_1 = function (t) {
                        var data = [];
                        node.forEach(function (value, key) {
                            if (key !== field) {
                                data.push.apply(data, Array.from(value).filter(function (d) { return d[0] !== field; }));
                            }
                        });
                        var next = new Map();
                        data.forEach(function (item) {
                            if (next.has(item[0])) {
                                var dest = next.get(item[0]);
                                var src = item[1];
                                var newDest = new Map();
                                mergeTrees(dest, newDest, measures, dataField);
                                mergeTrees(src, newDest, measures, dataField);
                                next.set(item[0], newDest);
                            }
                            else {
                                next.set(item[0], new Map(item[1]));
                            }
                        });
                        var currentPath = path.slice(0, path.indexOf(m.name));
                        next.forEach(function (value, key) {
                            cacheData.set(createPath(key, axisSettings, currentPath.concat([key])).join('-'), value);
                        });
                        next.set(field, node.get(field));
                        node = next;
                    };
                    for (var t = 0; t < depth; t++) {
                        _loop_1(t);
                    }
                }
                node = node.get(m.name) || cacheData.get(path.slice(0, path.indexOf(m.name) + 1).join('-'));
            }
        });
        return node;
    };
    /** @hidden */
    var readData = function (dataTree, rowTuples, columnTuples, fields, columnSettings, rowSettings, measures) {
        var data = [];
        var dataField = fields.dataField, columnsData = fields.columnsData;
        var rowsCache = new Map();
        rowTuples.forEach(function (row) {
            var rowNode = membersNode(dataTree, row.members.slice(), columnsData, rowSettings, measures, dataField, rowsCache);
            var rowColumnsNode = rowNode && rowNode.get(columnsData);
            columnTuples.forEach(function (col) {
                var members = col.members.slice();
                var measure = measures[0];
                if (members[members.length - 1].levelName === "[Measures].[MeasuresLevel]") {
                    var measuresMember_1 = members.pop();
                    measure = measures.find(function (m) { return String(m.name) === measuresMember_1.caption; }) || measure;
                }
                var colNode = rowColumnsNode && membersNode(rowColumnsNode, members, dataField, columnSettings, measures, dataField);
                var value = '', fmtValue = '', ordinal = 0;
                if (colNode && measure) {
                    var result = measure.aggregate.result(colNode.get(dataField));
                    value = String(result);
                    fmtValue = measure.aggregate.format(result);
                }
                data.push({
                    columnTuple: col,
                    data: { fmtValue: fmtValue, ordinal: ordinal, value: value },
                    rowTuple: row
                });
            });
        });
        return data;
    };

    var getTopMembersTuple = function (parentFields, axesSettings) {
        var allTuple = { members: [] };
        parentFields.forEach(function (topField) {
            var axis = axesSettings.find(function (a) { return a.key === topField; });
            var caption = axis ? axis.caption : "";
            var member = {
                caption: caption,
                children: [],
                hasChildren: true,
                parentName: "",
                levelNum: 0,
                levelName: caption,
                hierarchy: topField,
                name: caption
            };
            allTuple.members.push(member);
        });
        return allTuple;
    };
    var sortFunc = function (descriptor, axe) {
        return function (a, b) {
            var order = descriptor.dir;
            var sortableA = axe.sortValue(splitKeyValue(a[0])[1]);
            var sortableB = axe.sortValue(splitKeyValue(b[0])[1]);
            if (sortableA < sortableB) {
                return order === "asc" ? -1 : 1;
            }
            if (sortableA > sortableB) {
                return order === "asc" ? 1 : -1;
            }
            return 0;
        };
    };
    var mergeData = function (src, dest, exclude) {
        src.forEach(function (srcChild, k) {
            if (!exclude[k]) {
                var destChild = subNode(dest, k);
                mergeData(srcChild, destChild, exclude);
            }
        });
    };
    var childrenByKeys = function (dataTree, keys, exclude) {
        var result = [];
        var nodeData = function (node) { return Array.from(node).filter(function (n) { return !exclude[n[0]]; }); };
        var element = new Map(dataTree);
        var next;
        var _loop_1 = function (i) {
            next = element.get(keys[i]);
            if (next) {
                element = new Map(next);
            }
            else if (i < keys.length - 1 && Array.from(element).some(function (e) { return splitKeyValue(e[0])[0] === keys[i]; })) {
                var curLevel_1 = [];
                element.forEach(function (child, key) {
                    if (!exclude[key]) {
                        curLevel_1.push.apply(curLevel_1, nodeData(new Map(child)));
                    }
                });
                element = new Map();
                curLevel_1.forEach(function (item) {
                    if (element.has(item[0])) {
                        var dest = element.get(item[0]);
                        var src = item[1];
                        var newDest = new Map();
                        mergeData(dest, newDest, exclude);
                        mergeData(src, newDest, exclude);
                        element.set(item[0], newDest);
                    }
                    else {
                        element.set(item[0], new Map(item[1]));
                    }
                });
            }
            else if (i === 0 || i === keys.length - 1) {
                if (Array.from(element).some(function (e) { return splitKeyValue(e[0])[0] === keys[i]; })) {
                    result.push.apply(result, nodeData(element));
                }
            }
        };
        for (var i = 0; i < keys.length; i++) {
            _loop_1(i);
        }
        return result;
    };
    /** @hidden */
    var rootFields = function (definitions) {
        var fields = new Set();
        definitions.forEach(function (item) {
            if (item.name.length === 1 && !splitKeyValue(item.name[0])[1]) {
                fields.add(item.name[0]);
            }
        });
        return fields;
    };
    /** @hidden */
    var createTuples = function (axesSettings, definitions, dataTree, sortDescriptors, excludeFields) {
        var parentFields = rootFields(definitions);
        var flatMembers = [];
        var topTuple = getTopMembersTuple(parentFields, axesSettings);
        flatMembers.push(topTuple);
        var _loop_2 = function (i) {
            var currDef = definitions[i];
            if (currDef.name.length === 1 && !currDef.expand && parentFields.has(currDef.name[0])) {
                return "continue";
            }
            var keysToAdd = new Set(parentFields.keys());
            var currDefMembers = [];
            var keys = [];
            var tuples = [];
            var axe;
            currDef.name.forEach(function (element, index) {
                var _a;
                var _b = splitKeyValue(element), field = _b[0], value = _b[1];
                axe = axesSettings.find(function (a) { return a.key === field; });
                if (value) {
                    keysToAdd.delete(field);
                    keys.push(element);
                    var member = {
                        children: [],
                        caption: value,
                        hierarchy: field,
                        levelNum: 1,
                        levelName: field + " " + field,
                        name: element,
                        parentName: axe ? axe.caption : ""
                    };
                    currDefMembers.push(member);
                }
                else if (currDef.expand && currDef.name.length - 1 === index) {
                    keysToAdd.delete(element);
                    keys.push(element);
                    var children = childrenByKeys(dataTree, keys, excludeFields);
                    var descriptor = sortDescriptors.find(function (desc) { return desc.field === field; });
                    if (descriptor && descriptor.dir) {
                        children.sort(sortFunc(descriptor, axe));
                    }
                    for (var c = 0; c < children.length; c++) {
                        var leafValue = children[c][0];
                        var leafTuple = { members: [] };
                        tuples.push(leafTuple);
                        var caption = splitKeyValue(leafValue)[1];
                        axe = axesSettings.find(function (a) { return a.key === element; });
                        var member = {
                            caption: caption,
                            children: [],
                            levelName: element + " " + element,
                            levelNum: 1,
                            parentName: axe ? axe.caption : "",
                            hierarchy: element,
                            name: leafValue
                        };
                        (_a = leafTuple.members).push.apply(_a, currDefMembers);
                        leafTuple.members.push(member);
                    }
                }
                else if (currDef.expand) {
                    axe = axesSettings.find(function (a) { return a.key === element; });
                    var axisCaption = axe ? axe.caption : "";
                    keysToAdd.delete(element);
                    keys.push(element);
                    var member = {
                        children: [],
                        caption: axisCaption,
                        hierarchy: element,
                        levelName: axisCaption,
                        levelNum: 0,
                        name: axisCaption,
                        parentName: ""
                    };
                    currDefMembers.push(member);
                }
                keysToAdd.forEach(function (key) {
                    tuples.forEach(function (tuple) {
                        axe = axesSettings.find(function (a) { return a.key === key; });
                        var curCaption = axe ? axe.caption : "";
                        var member = {
                            children: [],
                            hasChildren: true,
                            caption: curCaption,
                            hierarchy: key,
                            levelName: curCaption,
                            levelNum: 0,
                            name: curCaption,
                            parentName: ""
                        };
                        tuple.members.push(member);
                    });
                });
                flatMembers.push.apply(flatMembers, tuples);
            });
        };
        for (var i = 0; i < definitions.length; i++) {
            _loop_2(i);
        }
        return flatMembers;
    };
    var addMeasure = function (tuple, measure) {
        var measureMember = {
            caption: String(measure.name),
            children: [],
            hasChildren: false,
            hierarchy: "[Measures]",
            levelName: "[Measures].[MeasuresLevel]",
            levelNum: 0,
            name: "[Measures].[" + measure.name + "]",
            parentName: ""
        };
        var tupleCopy = copy(tuple);
        tupleCopy.members.push(measureMember);
        return tupleCopy;
    };
    /** @hidden */
    var addMultipleMeasures = function (tuples, measures) {
        if (measures.length < 2) {
            return tuples;
        }
        var result = tuples.slice();
        for (var i = result.length - 1; i >= 0; i--) {
            var tuple = result[i];
            result[i] = addMeasure(result[i], measures[0]);
            for (var m = 1; m < measures.length; m++) {
                var tupleWithMeasure = addMeasure(tuple, measures[m]);
                result.splice(i + 1, 0, tupleWithMeasure);
            }
        }
        return result;
    };
    /** @hidden */
    var createLocalDataState = function (args) {
        var _a;
        var dataTree = args.dataTree, rowSettings = args.rowSettings, columnSettings = args.columnSettings, rowAxes = args.rowAxes, columnAxes = args.columnAxes, measures = args.measures, sort = args.sort, fields = args.fields;
        var exclude = (_a = {}, _a[fields.columnsData] = fields.columnsData, _a[fields.dataField] = fields.dataField, _a);
        var columnTuples = addMultipleMeasures(createTuples(columnSettings, columnAxes, dataTree.get(fields.columnsData), sort, exclude), measures);
        var rowTuples = createTuples(rowSettings, rowAxes, dataTree, sort, exclude);
        var resultData = readData(dataTree, rowTuples, columnTuples, fields, columnSettings, rowSettings, measures);
        return {
            columns: columnTuples,
            data: resultData,
            rows: rowTuples
        };
    };

    /** @hidden */
    var createFlatSchemaDimensions = function (dimensions, measures) {
        var result = Object.keys(dimensions).map(function (dim) { return ({
            caption: dim,
            defaultHierarchy: dim,
            description: '',
            name: dim,
            uniqueName: dim,
            hierarchyUniqueName: dim,
            measure: true,
            type: 1 // https://github.com/telerik/kendo-pivotgrid-common/blob/develop/src/models/responseDiscover.ts#L12-L14
        }); });
        if (measures.length) {
            result.push({
                caption: 'Measures',
                children: measures.map(function (m) { return ({
                    aggregator: '1',
                    caption: String(m.name),
                    defaultFormat: '',
                    description: '',
                    displayFolder: '',
                    groupName: String(m.name),
                    name: String(m.name),
                    uniqueName: String(m.name)
                }); }),
                type: 2,
                description: '',
                name: 'Measures',
                uniqueName: '[Measures]'
            });
        }
        return result;
    };

    exports.addKPI = addKPI;
    exports.addMultipleMeasures = addMultipleMeasures;
    exports.averageAggregate = averageAggregate;
    exports.buildKPIMeasures = buildKPIMeasures;
    exports.cloneDataTree = cloneDataTree;
    exports.compareAxes = compareAxes;
    exports.configuratorReducer = configuratorReducer;
    exports.createAxisDescriptors = createAxisDescriptors;
    exports.createDataState = createDataState;
    exports.createDataTree = createDataTree;
    exports.createDiscoverBody = createDiscoverBody;
    exports.createFlatSchemaDimensions = createFlatSchemaDimensions;
    exports.createLocalDataState = createLocalDataState;
    exports.createRequestBody = createRequestBody;
    exports.createTuples = createTuples;
    exports.discoverCommands = discoverCommands;
    exports.fetchData = fetchData;
    exports.fetchDiscover = fetchDiscover;
    exports.headersReducer = headersReducer;
    exports.maxAggregate = maxAggregate;
    exports.mergeTrees = mergeTrees;
    exports.minAggregate = minAggregate;
    exports.parseResponse = parseResponse;
    exports.readData = readData;
    exports.rootFields = rootFields;
    exports.setFilter = setFilter;
    exports.setSort = setSort;
    exports.sumAggregate = sumAggregate;
    exports.toColumns = toColumns;
    exports.toData = toData;
    exports.toRows = toRows;
    exports.toTree = toTree;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});

})();