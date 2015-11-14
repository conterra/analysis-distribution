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
    "ct/_when",
    "ct/array",
    "./GeometryWidget",
    "ct/_Connect"
], function (declare,
        d_array,
        ct_when,
        ct_array,
        Widget,
        _Connect) {
    return declare([_Connect], {
        constructor: function (properties) {
            this.cvStores = [];
            this.gStores = [];
            this.stores = [];
        },
        createInstance: function () {
            this.inherited(arguments);
            return this.widget;
        },
        activate: function () {
            this.inherited(arguments);
            var widget = this.widget = new Widget({source: this});
            widget.resize();
            this.connect(this._tool, "onDeactivate", function () {
                this._drawGeometryHandler.clearGraphics();
            });
        },
        _getMetadata: function (store) {
            var data = [];
            var metadata = store.getMetadata();
            return ct_when(metadata, function (mdata) {
                var fields = mdata.fields;
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i].domain)
                        data.push(fields[i].alias);

                }
                return data;
            });
        },
        _getSelectedStoreObj: function (id) {
            return ct_array.arraySearchFirst(this.stores, {id: id});
        },
        _setProcessing: function (processing) {
            var tool = this._tool;
            if (tool) {
                tool.set("processing", processing);
            }
        },
        addStore: function (store, serviceproperties) {
            this.stores.push(store);
            ct_when(this._getMetadata(store), function (data) {
                if (data.length > 0)
                    this.cvStores.push(store);
                ct_when(store.getMetadata(), function (data) {
                    if (data.geometryType === "esriGeometryPolygon")
                        this.gStores.push(store);
                    if (this.widget)
                        this.widget.updateStores();
                }, this);
            }, this);
        },
        onDone: function () {
            this._setProcessing(true);
            this._drawGeometryHandler.clearGraphics();
            var store = this._getSelectedStoreObj(this.widget.getSelectedGStore());
            var cvStore = this._getSelectedStoreObj(this.widget.getSelectedCVStore());
            var extent = this._mapState.getExtent();
            ct_when(store.query({geometry: {$intersects: extent}}, {fields: {"geometry": true}}), function (result) {
                d_array.forEach(result, function (feature) {
                    var geom = feature.geometry;
                    this._drawGeometryHandler.drawGeometry(geom);
                    var deferred = cvStore.query({geometry: {$intersects: geom}}, {count: 0}).total;
                    ct_when(deferred, function (count) {
                        this._drawGeometryHandler.drawDistanceText(geom, count.toString());
                        this._setProcessing(false);
                    }, this);
                }, this);
            }, this);

        }
    });
});
		