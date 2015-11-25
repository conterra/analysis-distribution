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
    "ct/_Connect",
    "ct/mapping/edit/GraphicsRenderer",
    "esri/Color",
    "esri/geometry/Circle",
    "esri/symbols/Font",
    "esri/symbols/TextSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "dojo/_base/Color"

], function (declare, _Connect, GraphicsRenderer, Color, Circle, Font, TextSymbol, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, d_Color) {

    return declare([_Connect], {
        activate: function () {
            this.graphicsRenderer = GraphicsRenderer.createForGraphicsNode("srInputGeometry", this._mapModel);
            this.graphicsRenderer.get("graphicsNode").set("renderPriority", -100);
            if (this.graphicsRenderer.get("hasNodeCreated")) {
                this._mapModel.fireModelStructureChanged({
                    source: this
                });
            }
            var drawController = this._drawController;

            drawController.set("fillSymbol", this._getSymbolForPolygon());
        },
        allowUserToDrawGeometry: function (geoType) {
            this.deactivateDraw();
            var drawController = this._drawController;
            this.connect("draw", drawController, "onGeometryDrawn", this._handleGeometryDrawn);
            drawController["activateDraw" + geoType]();
        },
        drawGeometry: function (geometry) {
            var graphicsRenderer = this.graphicsRenderer;
            var feature = {
                geometry: geometry
            };
            if (geometry.type === "polygon") {
                feature.symbol = this._getSymbolForPolygon();
            }
            graphicsRenderer.draw(feature);
            return feature;
        },
        clearGraphics: function () {
            var graphicsRenderer = this.graphicsRenderer;
            graphicsRenderer.clear();
        },
        deactivateDraw: function () {
            this._drawController.deactivateDraw();
        },
        _getSymbolForPolygon: function () {
            return new SimpleFillSymbol(
                    SimpleFillSymbol.STYLE_SOLID,
                    new SimpleLineSymbol(
                            SimpleLineSymbol.STYLE_DASHDOT,
                            new Color([0, 0, 0]),
                            2
                            ),
                    new Color([0, 150, 255, 0.1])
                    );
        },
        drawDistanceText: function (geometry, text) {
            var font = new Font();
            font.setSize("10pt");
            font.setWeight(Font.WEIGHT_BOLD);
            var textSymbol = new TextSymbol(text);
            textSymbol.setColor(new d_Color([255, 255, 255]));
            textSymbol.setAlign(TextSymbol.ALIGN_MIDDLE);
            textSymbol.setVerticalAlignment(TextSymbol.ALIGN_MIDDLE);
            textSymbol.setFont(font);
            //textSymbol.setOffset(10, -5);

            var symbol = new SimpleMarkerSymbol({
                "color": [0, 150, 0, 255],
                "size": 20,
                "angle": 0,
                "xoffset": 0,
                "yoffset": 0,
                "type": "esriSMS",
                "style": "esriSMSCircle"/*,
                 "outline": {
                 "color": [0, 0, 0, 255],
                 "width": 1,
                 "type": "esriSLS",
                 "style": "esriSLSSolid"
                 }*/
            });
            this.graphicsRenderer.draw(
                    {
                        geometry: geometry,
                        symbol: symbol
                    }
            );
            this.graphicsRenderer.draw(
                    {
                        geometry: geometry,
                        symbol: textSymbol
                    }
            );
        },
        _handleGeometryDrawn: function (evt) {
            var geometry = evt.geometry;
            var graphicsRenderer = this.graphicsRenderer;
            graphicsRenderer.clear();
            this.drawGeometry(geometry);
        }
    });
});

