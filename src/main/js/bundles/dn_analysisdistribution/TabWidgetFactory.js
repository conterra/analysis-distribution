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
        _getMetadata: function () {
            var data = [];
            var metadata = this._store.getMetadata();
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
        setStore: function (store, props) {
            this._store = store;
        },
        createInstance: function () {
            this.data = this._getMetadata();
            var tabcontainer = this.tabcontainer = new TabContainer();
            var tabs = this.tabs;
            var store = this._store;
            var mapState = this._mapState;
            var props = this._properties;
            var i18n = this._i18n.get();
            var tool = this._tool;
            d_array.forEach(this.data || [], function (alias) {
                var tab = new ChartingWidget({
                    props: props,
                    alias: alias,
                    store: store,
                    mapState: mapState,
                    i18n: i18n,
                    tool: tool
                });
                if (tab) {
                    tabcontainer.addChild(tab);
                    tab.startup();
                }
            }, this);
            return tabcontainer;
        },
        modified: function () {
            var props = this._properties;
            var storeId = props.storeId;
            var chartType = props.chartType;
            var useExtent = props.useExtent;
            var enableChartSwitch = props.enableChartSwitch;
            var enableExtentSwitch = props.enableExtentSwitch;
            d_array.forEach(this.tabcontainer.getChildren(), function (children) {
                //children.set("_storeId", storeId);
                children.set("_chartType", chartType);
                children.set("_useExtent", useExtent);
                children.set("_enableChartSwitch", enableChartSwitch);
                children.set("_enableExtentSwitch", enableExtentSwitch);
                children._onNewProperties();
            }, this);
        }
    });
});
		