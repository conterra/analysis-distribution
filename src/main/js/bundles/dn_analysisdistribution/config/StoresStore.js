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
    "ct/store/ComplexMemory",
    "ct/_when"
], function (declare, ComplexMemory, ct_when) {
    return declare([ComplexMemory], {
        addStore: function (store, properties) {
            ct_when(this._getMetadata(store), function (data) {
                var id = properties.id;
                var title = properties.title || id;
                if (data.length > 0)
                    this.put({
                        id: id,
                        title: title
                    });
            }, this);
        },
        _getMetadata: function (store) {
            var data = [];
            var metadata = store.getMetadata();
            return ct_when(metadata, function (mdata) {
                var fields = mdata.fields;
                for (var i = 0; i < fields.length; i++) {
                    if (fields[i].domain) {
                        data.push(fields[i].alias);
                    }
                }
                return data;
            });
        }
    });
});
		