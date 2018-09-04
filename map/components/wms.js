define(['jquery', 'leaflet', 'css!leaflet-css'],
    function ($, L) {


    L.TileLayer.WMS.include({
        // getLegendGraphic returns a hash of legend URLs. The keys are the layer names the values are the legend URLs
        getLegendGraphic: function(options){

            var layers = this.wmsParams.layers.split(',');
            var legends = {};

            var legendReq = {
                'SERVICE' : 'WMS',
                'LAYER'   : this.wmsParams.layers,
                'REQUEST' : 'GetLegendGraphic',
                'VERSION' : this.wmsParams.version,
                'FORMAT'  : this.wmsParams.format,
                'WIDTH'   : 20,
                'HEIGHT'  : 20
            };

            legendReq = L.extend(legendReq,options);
            var url = L.Util.template(this._url)

            for(var i = 0;i<layers.length;i++){
                legendReq.LAYER = layers[i];
                legends[layers[i]] = url + L.Util.getParamString(legendReq, url, true);
            }

            return legends;
        }
    });

	/**
	 * This adds WMS functionality to the map widget.
	 */
	function WmsMapComponent(mapWidget) {

        this.configNamespace = 'wms';
        this.configWmsTileServers = 'wmsTileServers';

        this.separator = ' ; ';

        this.mapWidget = mapWidget;

        if (!this.mapWidget.config[this.configNamespace]) {

            this.mapWidget.config[this.configNamespace] = {};
            this.mapWidget.config[this.configNamespace][this.configWmsTileServers] = [{
                url: 'https://maps.dwd.de/geoserver/ows?',
                opacity: 0.7,
                layers: ['dwd:GefuehlteTemp']
            }];

        }

        
	}
    
    WmsMapComponent.prototype.initMap = function() {
        if (this.wmsControl) {
            this.wmsControl.remove(this.mapWidget.map);
        }

        if (this.legendLayers) {
            for (var legendLayer of this.legendLayers) {
                legendLayer.remove(this.mapWidget.map);
            }
        }

        if (this.mapWidget.config[this.configNamespace][this.configWmsTileServers].length === 0) {
            return;
        }

        var wmsMaps = {
        };

        this.legendLayers = [];

        for (var tileServerIndex in this.mapWidget.config[this.configNamespace][this.configWmsTileServers]) {

            var wmsLayers = this.mapWidget.config[this.configNamespace][this.configWmsTileServers][tileServerIndex].layers;

            var layer = L.tileLayer.wms(this.mapWidget.config[this.configNamespace][this.configWmsTileServers][tileServerIndex].url, {
                layers: wmsLayers.join(','),
                opacity: this.mapWidget.config[this.configNamespace][this.configWmsTileServers][tileServerIndex].opacity
            });
            layer.addTo(this.mapWidget.map);

            wmsMaps[wmsLayers] = layer;

            for (var wmsLayer of wmsLayers) {
                
                var legend = L.control({position: 'bottomright'}); 
                legend.onAdd = function (map) {        
                    var div = L.DomUtil.create('div', 'info legend');
                    div.innerHTML = '<img src="' + layer.getLegendGraphic()[wmsLayer] +  '">';     
                    return div;
                }.bind(this);      
                legend.addTo(this.mapWidget.map);
    
                this.legendLayers.push(legend);
            }
        }

        this.wmsControl = L.control.layers(null, wmsMaps, {position: 'bottomleft'}).addTo(this.mapWidget.map);
    }

    WmsMapComponent.prototype.getConfigStructure = function() {
        return [
            {
                id: this.configNamespace + ':' + this.configWmsTileServers,
                name: 'Tile servers (wms base url' + this.mapWidget.separator + 'opacity' + this.mapWidget.separator + 'layers)',
                type: 'textarea',
                value: this.mapWidget.config[this.configNamespace][this.configWmsTileServers].map(function (tileServer) {
                    return tileServer.url + this.mapWidget.separator + tileServer.opacity + this.mapWidget.separator + tileServer.layers.join(this.mapWidget.separator);
                }.bind(this)).join('\n')
            }
        ];
    }

    WmsMapComponent.prototype.parseConfigStructure = function(newConfigStructure) {

        newConfigStructure.forEach(function (configEntry) {
            if (configEntry.id.startsWith(this.configNamespace)) {

                var componentConfigEntry = configEntry.id.split(':')[1];

                this.mapWidget.config[this.configNamespace][componentConfigEntry] = configEntry.value.split('\n').filter(function (elem) {
                    return elem !== '';
                }).map(function (line) {
                    var elements = line.split(this.separator);
                    return {
                        url: elements[0].trim(),
                        opacity: elements[1].trim(),
                        layers: elements.slice(2).map(function (elem) {return elem.trim();})
                    };
                }.bind(this));

            }
        }.bind(this));

        // Return Deferred in case we need to wait for something at some point
        // return $.when();

    }

	WmsMapComponent.prototype.redraw = function () {
	};
	WmsMapComponent.prototype.destroy = function () {
	};

	// return our widget
	return WmsMapComponent;

});