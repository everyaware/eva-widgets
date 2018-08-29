define(['jquery', 'leaflet', 'app/eva-live-connection', 'app/config-view', 'css!./widget', 'css!leaflet-css'],
    function ($, L, EvaLiveConnection, ConfigView) {


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
        this.default_location_channel = 'locations';
        this.default_latitude_component = 'latitude';
        this.default_longitude_component = 'longitude';

        // this.image = $('<img width="100%" height="100%">');
        this.container = $('<div class="map-widget-container"></div>');
        $(this.selector).append(this.container);

        this.marker = null;

        // Connect to EveryAware servers
        this.evaLiveConnection =
            new EvaLiveConnection(function (newData) {


                var newData = newData.data[0];

                console.log(newData);

                if (this.marker) {
                    this.map.removeLayer(this.marker);
                }

                var latChannel = this.config.data.latitude.channel;
                var lonChannel = this.config.data.longitude.channel;
                var valChannel = this.config.data.value.channel;
                var latComponent = this.config.data.latitude.component;
                var lonComponent = this.config.data.longitude.component;
                var valComponent = this.config.data.value.component;

                var icon = L.divIcon({
                    html: newData.channels[valChannel][valComponent] + ''
                });

                this.marker = L.marker([
                    newData.channels[latChannel][latComponent],
                    newData.channels[lonChannel][lonComponent]
                ], {
                    icon: icon
                    // title: newData.channels[valChannel][valComponent],
                    // opacity: 1
                }).addTo(this.map);

                // this.marker.bindTooltip('' + newData.channels[valChannel][valComponent], {
                //     permanent: true,
                //     offset: [0, 0]
                // }).openTooltip();



            }.bind(this));
        
        if (config) {
            this.config = config;

            // Data is already selected, so we can initiate the data
            // transfer by registering for live-data
            // Note: We assume that all the data is in the same source and
            // that latitude is in the same channel as longitude.
            this.evaLiveConnection.register(this.config.data.latitude.feedId,
                this.config.data.latitude.sourceId,
                this.config.data.latitude.channel + ',' + this.config.data.value.channel);

            this.redraw();
        } else {
            this.config = {
                center: L.latLng(50, 9.97),
                zoom: 8,
                baseTileServer: {
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                },
                data: {
                    latitude: {
                        feedId: '',
                        sourceId: '',
                        channel: this.default_location_channel,
                        component: this.default_latitude_component
                    },
                    longitude: {
                        feedId: '',
                        sourceId: '',
                        channel: this.default_location_channel,
                        component: this.default_longitude_component
                    },
                    value: {
                        feedId: '',
                        sourceId: '',
                        channel: '',
                        component: ''
                    }
                },
                wmsTileServers: [{
                    url: 'https://maps.dwd.de/geoserver/ows?',
                    opacity: 0.7,
                    layers: ['dwd:GefuehlteTemp']
                }]
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
                id: 'latitude',
                name: 'Latitude',
                type: 'eva-component',
                value: this.config.data.latitude
            },
            {
                id: 'longitude',
                name: 'Longitude',
                type: 'eva-component',
                value: this.config.data.longitude
            },
            {
                id: 'value',
                name: 'Value',
                type: 'eva-component',
                value: this.config.data.value
            },
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
                
                // JSON.stringify and JSON.parse is currently
				// the fastest way of cloning
				// an object in javascript
				var oldConfig = JSON.parse(JSON.stringify(this.config));

                newConfigStructure.forEach(function (configEntry) {
                    if (configEntry.id === 'wmsTileServers') {
                        this.config[configEntry.id] = configEntry.value.split('\n').filter(function (elem) {
                            return elem !== '';
                        }).map(function (line) {
                            var elements = line.split(this.separator);
                            return {
                                url: elements[0].trim(),
                                opacity: elements[1].trim(),
                                layers: elements.slice(2).map(function (elem) {return elem.trim();})
                            };
                        }.bind(this));

                    } else {
                        this.config.data[configEntry.id] = configEntry.value;
                    }
                }.bind(this));

                // Do nothing when nothing changed
                // JSON.stringify is the easiest way to have a deep
                // comparison of objects
                if (JSON.stringify(oldConfig) ===
                    JSON.stringify(this.config)) {
                    callback();
                    return;
                }

                // Change live connection registration when feedId,
                // sourceId or channel was changed
                var dataSources = Object.keys(this.config.data);
                for (var dataSource of dataSources) {

                    if (this.config.data[dataSource].feedId != oldConfig.data[dataSource].feedId ||
                        this.config.data[dataSource].sourceId != oldConfig.data[dataSource].sourceId ||
                        this.config.data[dataSource].channel != oldConfig.data[dataSource].channel) {

                        // Unregister old live-data connection
                        this.evaLiveConnection.unregister(oldConfig.data[dataSource].feedId,
                            oldConfig.data[dataSource].sourceId,
                            oldConfig.data[dataSource].channel);

                        // Register new live-data connection
                        // Note: We assume that all the data is in the same source and
                        // that latitude is in the same channel as longitude.
                        this.evaLiveConnection.register(this.config.data.latitude.feedId,
                            this.config.data.latitude.sourceId,
                            this.config.data.latitude.channel + ',' + this.config.data.value.channel);

                    }

                }

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
        // Unregister old live-data connections
        this.evaLiveConnection.unregister(this.config.data.feedId,
            this.config.data.sourceId,
            this.config.data.latitude.channel);
        this.evaLiveConnection.unregister(this.config.data.feedId,
            this.config.data.sourceId,
            this.config.data.longitude.channel);
        this.evaLiveConnection.unregister(this.config.data.feedId,
            this.config.data.sourceId,
            this.config.data.value.channel);
        // Close connection
        this.evaLiveConnection.destroyStompClient();
	};

	// return our widget
	return Map;

});