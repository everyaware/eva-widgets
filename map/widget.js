define(['jquery', 'leaflet', 'app/config-view', './components/wms.js', './components/livePosition.js', 'css!./widget', 'css!leaflet-css'],
    function ($, L, ConfigView, WmsMapComponent, LivePositionMapComponent) {

	/**
	 * This widget is for displaying a map.
	 */
	function Map(selector, config) {

		// save selector for later reference
        this.selector = selector;

        this.separator = ' ; ';

        this.configNamespace = 'base';

        this.container = $('<div class="map-widget-container"></div>');
        $(this.selector).append(this.container);
        
        if (config) {
            this.config = config;


            // this.redraw();
        } else {
            this.config = {};
            this.config[this.configNamespace] = {
                center: L.latLng(50, 9.97),
                zoom: 8,
                baseTileServer: {
                    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }
            };

        }
        // Initialize components
        this.components = [
            new WmsMapComponent(this),
            new LivePositionMapComponent(this)
        ];

        // this.container.get(0) returns the HTML DOM element
        this.map = L.map(this.container.get(0)).setView(this.config[this.configNamespace].center, this.config[this.configNamespace].zoom);

        this.initMap();

        this.redraw();

        this.map.on('zoomend moveend', function (event) {
            this.config[this.configNamespace].center = this.map.getCenter();
            this.config[this.configNamespace].zoom = this.map.getZoom();
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

        L.tileLayer(this.config[this.configNamespace].baseTileServer.url, {
            attribution: this.config[this.configNamespace].baseTileServer.attribution
        }).addTo(this.map);

        for (var component of this.components) {
            component.initMap();
        }
    }

	Map.prototype.renderConfigDialog = function (selector, callback) {

        var configStructure = [];

        for (var component of this.components) {
            var componentConfigStructure = component.getConfigStructure();
            configStructure = configStructure.concat(componentConfigStructure);
        }

        ConfigView(selector,
            configStructure,
            function (newConfigStructure) {
                

                newConfigStructure.forEach(function (configEntry) {
                    if (configEntry.id.startsWith(this.configNamespace)) {

                        var componentConfigEntry = configEntry.id.split(':')[1];

                        this.config[this.configNamespace][componentConfigEntry] = configEntry.value;

                    }
                }.bind(this));

                for (var component of this.components) {
                    component.parseConfigStructure(newConfigStructure);
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
        for (var component of this.components) {
            component.redraw();
        }
	};
	Map.prototype.destroy = function () {
        for (var component of this.components) {
            component.destroy();
        }
	};

	// return our widget
	return Map;

});