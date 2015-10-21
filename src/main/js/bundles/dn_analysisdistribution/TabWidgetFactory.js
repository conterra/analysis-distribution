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
    "dijit/layout/TabContainer",
    "./ChartingWidget"
], function (declare,
        d_array,
        ct_when,
        TabContainer,
        ChartingWidget) {
    return declare([], {
        createInstance: function () {
            var tabcontainer = this.tabcontainer = new TabContainer();
            //var storeId = this._properties.storeId;
            //var store = this._getSelectedStore(storeId);
            var store = this._store;
            if (store !== undefined)
                this._addTabs(store);
            return tabcontainer;
        },
        modified: function (evt) {
            debugger
            var props = this._properties;
            var storeId = props.storeId;
            var store = this._getSelectedStore(storeId);
            var chartType = props.chartType;
            var useExtent = props.useExtent;
            var enableChartSwitch = props.enableChartSwitch;
            var enableExtentSwitch = props.enableExtentSwitch;
            var spatialOperator = props.spatialOperator;
            d_array.forEach(this.tabcontainer.getChildren(), function (children) {
                children.set("store", store);
                children.set("_chartType", chartType);
                children.set("_useExtent", useExtent);
                children.set("_enableChartSwitch", enableChartSwitch);
                children.set("_enableExtentSwitch", enableExtentSwitch);
                children.set("_spatialOperator", spatialOperator);
                children._onNewProperties();
            }, this);
        },
        setStore: function (store, props) {
            this._store = store;
        },
        /*addStores: function (store) {
         if (store.id === this._properties.storeId)
         this._addTabs(store);
         },*/
        _addTabs: function (store) {
            var mapState = this._mapState;
            var props = this._properties;
            var i18n = this._i18n.get();
            var tool = this._tool;
            var data = this.data = this._getMetadata(store);
            d_array.forEach(data || [], function (alias) {
                var tab = new ChartingWidget({
                    props: props,
                    alias: alias,
                    store: store,
                    mapState: mapState,
                    i18n: i18n,
                    tool: tool
                });
                if (tab) {
                    if (!this.tabcontainer) {
                        this.tabcontainer = new TabContainer();
                    }
                    this.tabcontainer.addChild(tab);
                    tab.startup();
                }
            }, this);
        },
        _getSelectedStore: function (id) {
            var s;
            var agsstores = this.stores;
            d_array.forEach(agsstores, function (store) {
                if (id === store.id) {
                    s = store;
                }
            }, this);
            return s;
        },
        _getMetadata: function (store) {
            var data = [];
            var metadata = store.getMetadata();
            ct_when(metadata, function (mdata) {
                var fields = mdata.fields;
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i].domain) {
                        data.push(fields[i].alias);
                    }
                }
            });
            return data;
        }
    });
});
		