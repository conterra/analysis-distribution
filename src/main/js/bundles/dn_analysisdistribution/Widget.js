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
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/Widget.html",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "ct/util/css",
    "ct/async",
    "ct/_when",
    "ct/_Connect",
    "dojo/dom-geometry",
    "dojo/store/Memory",
    "dijit/form/FilteringSelect"
], function (declare,
        _Widget,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        templateStringContent,
        domConstruct,
        d_array,
        BorderContainer,
        ContentPane,
        ct_css,
        ct_async,
        ct_when,
        _Connect,
        domGeometry,
        Memory,
        FilteringSelect) {
    return declare([_Widget, _TemplatedMixin,
        _WidgetsInTemplateMixin, _Connect], {
        templateString: templateStringContent,
        postCreate: function () {
            this.maxComboBoxHeight = 160;
            var storeData = this.storeData = this._getStoreData(this.stores);
            return ct_when(storeData, function (storeData) {
                this.storeData = storeData;
                this._init();
            }, this);

            this.inherited(arguments);
        },
        resize: function (dims) {
            this._container.resize(dims);
        },
        addTabContainer: function (tabContainer) {
            domConstruct.place(tabContainer.domNode, this._tabNode, "replace");
        },
        _init: function () {
            var store = new Memory({
                data: this.storeData
            });
            var filteringSelect = this._filteringSelect = new FilteringSelect({
                name: "stores",
                value: this.storeId,
                store: store,
                searchAttr: "name",
                style: "width: 155px;",
                maxHeight: this.maxComboBoxHeight
            }, this._filteringSelectNode);
            this.connect(filteringSelect, "onChange", this._changeStore);
        },
        _changeStore: function () {
            this.source.changeStore(this._filteringSelect.value);
        },
        _getStoreData: function (stores) {
            return ct_async.join(d_array.map(stores, function (s) {
                return s.getMetadata();
            })).then(function (metadata) {
                return d_array.map(metadata, function (metadata, index) {
                    var id = stores[index].id;
                    var title = metadata.title || id;
                    return {name: title, id: id};
                });
            });
        },
        setSelectedStore: function(storeId) {
            this._filteringSelect.set("value", storeId);
        }
    });
});
		