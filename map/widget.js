define(['jquery', 'leaflet', 'app/config-view', 'css!./widget', 'css!leaflet-css'],
    function ($, L, ConfigView) {


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
	 * This widget is for displaying a map.
	 */
	function Map(selector, config) {

		// save selector for later reference
        this.selector = selector;

        this.separator = ' ; ';

        // this.image = $('<img width="100%" height="100%">');
        this.container = $('<div class="map-widget-container"></div>');
        $(this.selector).append(this.container);
        
        if (config) {
            this.config = config;
            this.redraw();
        } else {
            this.config = {
                center: L.latLng(50, 9.97),
                baseTileServer: {
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                },
                wmsTileServers: [{
                    url: 'https://maps.dwd.de/geoserver/ows?',
                    opacity: 0.7,
                    layers: ['dwd:GefuehlteTemp']
                }],
                zoom: 8
            };
        }

        // this.container.get(0) returns the HTML DOM element
        this.map = L.map(this.container.get(0)).setView(this.config.center, this.config.zoom);

        this.initMap();

        this.redraw();

        this.map.on('zoomend moveend', function (event) {
            this.config.center = this.map.getCenter();
            this.config.zoom = this.map.getZoom();
            $(this).trigger('state:change');
            this.redraw();
        }.bind(this));
	}

	Map.prototype.getConfig = function () {
		return this.config;
	}

	Map.prototype.getSelector = function () {
		return this.selector;
    }
    
    Map.prototype.initMap = function() {
        this.map.eachLayer(function (layer) {
            this.map.removeLayer(layer);
        }.bind(this));

        L.tileLayer(this.config.baseTileServer.url, {
            attribution: this.config.baseTileServer.attribution
        }).addTo(this.map);

        for (var tileServerIndex in this.config.wmsTileServers) {
            var layer = L.tileLayer.wms(this.config.wmsTileServers[tileServerIndex].url, {
                layers: this.config.wmsTileServers[tileServerIndex].layers.join(','),
                opacity: this.config.wmsTileServers[tileServerIndex].opacity
            });
            console.log(layer.getLegendGraphic());
            layer.addTo(this.map);
        }
    }

	Map.prototype.renderConfigDialog = function (selector, callback) {
        var configStructure = [
            {
                id: 'wmsTileServers',
                name: 'Tile servers (wms base url' + this.separator + 'opacity' + this.separator + 'layers)',
                type: 'textarea',
                value: this.config.wmsTileServers.map(function (tileServer) {
                    return tileServer.url + this.separator + tileServer.opacity + this.separator + tileServer.layers.join(this.separator);
                }.bind(this)).join('\n')
            }
        ];

        ConfigView(selector,
            configStructure,
            function (newConfigStructure) {

                newConfigStructure.forEach(function (configEntry) {
                    this.config[configEntry.id] = configEntry.value.split('\n').filter(function (elem) {
                        return elem !== '';
                    }).map(function (line) {
                        var elements = line.split(this.separator);
                        return {
                            url: elements[0].trim(),
                            opacity: elements[1].trim(),
                            transparency: 'true',
                            layers: elements.slice(2).map(function (layer) {return layer.trim()})
                        };
                    }.bind(this));
                }.bind(this));


                this.initMap();

                this.redraw();

                callback();
            }.bind(this));
	};

	/*
	 * These are some required life cycle functions. 
	 * We don't need to implement anything more sophisticated for this simple widget.
	 * Other tutorials go into more detail.
	 */
	Map.prototype.redraw = function () {
	};
	Map.prototype.destroy = function () {
	};

	// return our widget
	return Map;

});