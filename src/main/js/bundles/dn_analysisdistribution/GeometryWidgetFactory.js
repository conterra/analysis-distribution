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
    "dojo/_base/Deferred",
    "dojo/aspect",
    "ct/_when",
    "ct/array",
    "./GeometryWidget",
    "ct/_Connect"
], function (declare,
        d_array,
        Deferred,
        d_aspect,
        ct_when,
        ct_array,
        GeometryWidget,
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
            var widget = this.widget = new GeometryWidget({source: this});
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
            var gStore = this._getSelectedStoreObj(this.widget.getSelectedGStore());
            var cvStore = this._getSelectedStoreObj(this.widget.getSelectedCVStore());
            var extent = this._mapState.getExtent();
            ct_when(gStore.query({geometry: {$intersects: extent}}, {fields: {"geometry": true}}), function (result) {
                d_array.forEach(result, function (feature) {
                    var geom = feature.geometry;
                    this._drawGeometryHandler.drawGeometry(geom);
                    var deferred = cvStore.query({geometry: {$intersects: geom}}, {count: 0}).total;
                    ct_when(deferred, function (count) {
                        this._drawGeometryHandler.drawDistanceText(geom, count.toString());
                        this.connect(this._drawGeometryHandler, "_handleGeometryDrawn", function (evt) {
                            var point = evt.geometry;

                            var geom = this._getGeometry(point);
                            
                            ct_when(geom, function (geometry) {
                                debugger
                            });
                        });
                        this._setProcessing(false);
                        this._drawGeometryHandler.allowUserToDrawGeometry("Point");
                    }, this);
                }, this);
            }, this);
        },
        _getGeometry: function (mapPoint) {
            var def = new Deferred();
            var gStore = this._getSelectedStoreObj(this.widget.getSelectedGStore());
            ct_when(gStore.query({geometry: {$within: mapPoint}}, {fields: {"geometry": true}}), function (result) {
                def.resolve(result.geometry);
            }, this);
            return def;
        },
        _createChart: function () {
            var mapState = this._mapState;
            var props = this._properties;
            var i18n = this._i18n.get();
            var tool = this._tool;
            var cvStore = this._getSelectedStoreObj(this.widget.getSelectedCVStore());
            ct_when(this._getMetadata(cvStore), function (data) {
                d_array.forEach(data || [], function (alias) {
                    var widget = new ChartingWidget({
                        props: props,
                        alias: alias,
                        store: cvStore,
                        mapState: mapState,
                        i18n: i18n,
                        tool: tool
                    });
                    var window = this._windowManager.createWindow({
                        title: "i18n.wizard.editWindowTitle",
                        marginBox: {
                            w: 550,
                            h: 274,
                            t: 100,
                            l: 20
                        },
                        content: widget,
                        closable: true,
                        resizable: true
                    });
                    window.show();
                }, this);
            }, this);
        }
    });
});
		