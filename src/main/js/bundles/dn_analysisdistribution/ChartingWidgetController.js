/*
 * Copyright (C) 2015 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "ct/_Connect",
    "ct/store/Filter",
    "ct/_when",
    "dojo/DeferredList",
    "ct/_lang"
], function (declare,
        d_array,
        d_lang,
        _Connect,
        Filter,
        ct_when,
        DeferredList,
        ct_lang) {
    return declare([_Connect], {
        constructor: function (args) {
            this.source = args.source;
            this.tool = args.tool;
            this.inherited(arguments);
        },
        createChart: function (extentStatus, spatialOperator) {
            var cw = this.source;
            this._setProcessing(true);
            var a = cw.get("alias");
            var store = cw.get("store");

            var metadata = store.getMetadata();

            ct_when(metadata, function (mdata) {
                var codedValues;
                var fields = mdata.fields;
                var fieldName;
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i].domain) {
                        if (fields[i].alias === a) {
                            codedValues = fields[i].domain.codedValues;
                            fieldName = fields[i].name;
                        }
                    }
                }

                var extent = this._getCurrentExtent();
                var extentQuery = {};
                extentQuery["geometry"] = {};
                extentQuery.geometry[spatialOperator] = extent;
                var fields = {geometry: 0};
                fields[fieldName] = 1;
                var deferred;
                if (extentStatus === false) {
                    deferred = store.query({}, {fields: fields});
                } else {
                    deferred = store.query(extentQuery, {fields: fields});
                }

                ct_when(deferred, function (features) {
                    var tempCodedValues = d_array.map(codedValues, function (codedValue) {
                        return d_lang.mixin({count: 0}, codedValue);
                    });
                    d_array.forEach(features, function (feature) {
                        var code = feature[fieldName];
                        var filteredArray = d_array.filter(tempCodedValues, function (codedValue) {
                            return codedValue.code === code;
                        });
                        var codedValue = filteredArray[0];
                        codedValue && codedValue.count++;
                    });

                    if (!this._isEquivalent(cw.data, tempCodedValues)) {
                        cw.renderChart(tempCodedValues);
                    }

                    this._setProcessing(false);
                }, this);
            }, this);
        },
        _getCurrentExtent: function () {
            return this.source.get("mapState").getExtent();
        },
        _isEquivalent: function (a, b) {
            if (a === undefined || b === undefined) {
                return false;
            }
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; i++) {
                if (a[i].count !== b[i].count) {
                    return false;
                }
                if (a[i].name !== b[i].name) {
                    return false;
                }
                if (a[i].code !== b[i].code) {
                    return false;
                }
            }
            return true;
        },
        _setProcessing: function (processing) {
            var tool = this.tool;
            if (tool) {
                tool.set("processing", processing);
            }
        }
    });
});