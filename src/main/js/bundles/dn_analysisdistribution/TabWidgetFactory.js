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
    "ct/util/css",
    "dijit/layout/TabContainer",
    "./ChartingWidget",
    "./Widget"
], function (declare,
        d_array,
        ct_when,
        ct_css,
        TabContainer,
        ChartingWidget,
        Widget) {
    return declare([], {
        createInstance: function () {
            this.inherited(arguments);
            return this.widget;
        },
        activate: function () {
            this.inherited(arguments);
            var props = this._properties;
            var stores = this._stores;
            var storeId = props.storeId;
            var widget = this.widget = new Widget({stores: stores, storeId: storeId, source: this});
            ct_css.switchHidden(widget.filteringNode, !props.enableStoreSelect);
            widget.resize();
            var tabcontainer = this.tabcontainer = new TabContainer();
            //var store = this._store;
            var store = this._getSelectedStore(storeId);
            if (store !== undefined)
                this._addTabs(store);
            widget.addTabContainer(tabcontainer);
        },
        modified: function () {
            var props = this._properties;
            var chartType = props.chartType;
            var useExtent = props.useExtent;
            var enableChartSwitch = props.enableChartSwitch;
            var enableExtentSwitch = props.enableExtentSwitch;
            var spatialOperator = props.spatialOperator;
            var enableStoreSelect = props.enableStoreSelect;
            ct_css.switchHidden(this.widget.filteringNode, !enableStoreSelect);
            d_array.forEach(this.tabcontainer.getChildren(), function (children) {
                children.set("_chartType", chartType);
                children.set("_useExtent", useExtent);
                children.set("_enableChartSwitch", enableChartSwitch);
                children.set("_enableExtentSwitch", enableExtentSwitch);
                children.set("_spatialOperator", spatialOperator);
                children._onNewProperties();
                children.resize();
            }, this);
            this.changeStore(props.storeId);
            this.widget.setSelectedStore(props.storeId);
        },
        setStore: function (store) {
            this._store = store;
        },
        changeStore: function (storeId) {
            if (this.tabcontainer) {
                d_array.forEach(this.tabcontainer.getChildren(), function (children) {
                    this.tabcontainer.removeChild(children);
                }, this);
                var store = this._getSelectedStore(storeId);
                this._addTabs(store);
                d_array.forEach(this.tabcontainer.getChildren(), function (children) {
                    children._onNewData();
                }, this);
            }
        },
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
        },
        _getSelectedStore: function (id) {
            var s;
            d_array.forEach(this._stores, function (store) {
                if (id === store.id) {
                    s = store;
                }
            }, this);
            return s;
        }
    });
});
		