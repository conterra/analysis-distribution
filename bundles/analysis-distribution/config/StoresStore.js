define([
    "dojo/_base/declare",
    "ct/store/ComplexMemory"
], function (declare, ComplexMemory) {
    return declare([ComplexMemory], {
        addStore: function (store, properties) {
            var id = properties.id;
            var title = properties.title || id;
            this.put({
                id: id,
                title: title
            });
        }
    });
});
		