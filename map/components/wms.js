define(['jquery', 'leaflet', 'css!./widget', 'css!leaflet-css'],
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

        this.mapWidget = mapWidget;

        this.mapWidget.config[this.configNamespace] = {
            wmsTileServers: [{
                url: 'https://maps.dwd.de/geoserver/ows?',
                opacity: 0.7,
                layers: ['dwd:GefuehlteTemp']
            }]
        };
        
	}
    
    WmsMapDecorator.prototype.initMap = function() {

        for (var tileServerIndex in this.mapWidget.config[this.configNamespace][this.configWmsTileServers]) {
            var layer = L.tileLayer.wms(this.mapWidget.config[this.configNamespace][this.configWmsTileServers][tileServerIndex].url, {
                layers: this.mapWidget.config[this.configNamespace][this.configWmsTileServers][tileServerIndex].layers.join(','),
                opacity: this.mapWidget.config[this.configNamespace][this.configWmsTileServers][tileServerIndex].opacity
            });
            console.log(layer.getLegendGraphic());
            layer.addTo(this.mapWidget.map);
        }
    }

    WmsMapDecorator.prototype.getConfigStructure = function() {
        return [
            {
                id: this.configNamespace + ':' + this.configWmsTileServers,
                name: 'Tile servers (wms base url' + this.mapWidget.separator + 'opacity' + this.mapWidget.separator + 'layers)',
                type: 'textarea',
                value: this.mapWidget.config.wmsTileServers.map(function (tileServer) {
                    return tileServer.url + this.mapWidget.separator + tileServer.opacity + this.mapWidget.separator + tileServer.layers.join(this.mapWidget.separator);
                }.bind(this)).join('\n')
            }
        ];
    }

    WmsMapDecorator.prototype.parseConfigStructure = function(newConfigStructure) {

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

	WmsMapDecorator.prototype.redraw = function () {
	};
	WmsMapDecorator.prototype.destroy = function () {
	};

	// return our widget
	return WmsMapDecorator;

});