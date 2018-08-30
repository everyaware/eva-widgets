define(['jquery', 'leaflet', 'app/eva-live-connection', 'css!leaflet-css', 'css!./livePosition.css'],
    function ($, L, EvaLiveConnection) {

	/**
	 * This adds live functionality to the map widget.
	 */
	function LivePositionMapComponent(mapWidget) {

        this.configNamespace = 'livePosition';

        this.default_location_channel = 'locations';
        this.default_latitude_component = 'latitude';
        this.default_longitude_component = 'longitude';

        this.mapWidget = mapWidget;
        this.marker = null;

        // Connect to EveryAware servers
        this.evaLiveConnection =
            new EvaLiveConnection(function (newData) {


                var newData = newData.data[0];

                console.log(newData);

                if (this.marker) {
                    this.mapWidget.map.removeLayer(this.marker);
                }

                var latChannel = this.mapWidget.config[this.configNamespace].latitude.channel;
                var lonChannel = this.mapWidget.config[this.configNamespace].longitude.channel;
                var valChannel = this.mapWidget.config[this.configNamespace].value.channel;
                var latComponent = this.mapWidget.config[this.configNamespace].latitude.component;
                var lonComponent = this.mapWidget.config[this.configNamespace].longitude.component;
                var valComponent = this.mapWidget.config[this.configNamespace].value.component;

                var icon = L.divIcon({
                    className: 'map-marker',
                    html: newData.channels[valChannel][valComponent] + ''
                });

                this.marker = L.marker([
                    newData.channels[latChannel][latComponent],
                    newData.channels[lonChannel][lonComponent]
                ], {
                    icon: icon
                    // title: newData.channels[valChannel][valComponent],
                    // opacity: 1
                }).addTo(this.mapWidget.map);

                // this.marker.bindTooltip('' + newData.channels[valChannel][valComponent], {
                //     permanent: true,
                //     offset: [0, 0]
                // }).openTooltip();



            }.bind(this));

        if (!this.mapWidget.config[this.configNamespace]) {
            this.mapWidget.config[this.configNamespace] = {
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
            };
        } else {
            // Data is already selected, so we can initiate the data
            // transfer by registering for live-data
            // Note: We assume that all the data is in the same source and
            // that latitude is in the same channel as longitude.
            this.evaLiveConnection.register(this.mapWidget.config[this.configNamespace].latitude.feedId,
                this.mapWidget.config[this.configNamespace].latitude.sourceId,
                this.mapWidget.config[this.configNamespace].latitude.channel + ',' + this.mapWidget.config[this.configNamespace].value.channel);
            
        }
	}
    
    LivePositionMapComponent.prototype.initMap = function() {
    }

    LivePositionMapComponent.prototype.getConfigStructure = function() {
        return [
            {
                id: this.configNamespace + ':latitude',
                name: 'Latitude',
                type: 'eva-component',
                value: this.mapWidget.config[this.configNamespace].latitude
            },
            {
                id: this.configNamespace + ':longitude',
                name: 'Longitude',
                type: 'eva-component',
                value: this.mapWidget.config[this.configNamespace].longitude
            },
            {
                id: this.configNamespace + ':value',
                name: 'Value',
                type: 'eva-component',
                value: this.mapWidget.config[this.configNamespace].value
            }
        ];
    }

    LivePositionMapComponent.prototype.parseConfigStructure = function(newConfigStructure) {

        // JSON.stringify and JSON.parse is currently
        // the fastest way of cloning
        // an object in javascript
        var oldConfig = JSON.parse(JSON.stringify(this.mapWidget.config[this.configNamespace]));

        newConfigStructure.forEach(function (configEntry) {
            if (configEntry.id.startsWith(this.configNamespace)) {

                var componentConfigEntry = configEntry.id.split(':')[1];

                this.mapWidget.config[this.configNamespace][componentConfigEntry] = configEntry.value;

            }
        }.bind(this));

        // Do nothing when nothing changed
        // JSON.stringify is the easiest way to have a deep
        // comparison of objects
        if (JSON.stringify(oldConfig) ===
            JSON.stringify(this.mapWidget.config[this.configNamespace])) {
            return;
        }

        // Change live connection registration when feedId,
        // sourceId or channel was changed
        var dataSources = Object.keys(this.mapWidget.config[this.configNamespace]);
        for (var dataSource of dataSources) {

            if (this.mapWidget.config[this.configNamespace][dataSource].feedId != oldConfig[dataSource].feedId ||
                this.mapWidget.config[this.configNamespace][dataSource].sourceId != oldConfig[dataSource].sourceId ||
                this.mapWidget.config[this.configNamespace][dataSource].channel != oldConfig[dataSource].channel) {

                // Unregister old live-data connection
                this.evaLiveConnection.unregister(oldConfig[dataSource].feedId,
                    oldConfig[dataSource].sourceId,
                    oldConfig[dataSource].channel);

                // Register new live-data connection
                // Note: We assume that all the data is in the same source and
                // that latitude is in the same channel as longitude.
                this.evaLiveConnection.register(this.mapWidget.config[this.configNamespace].latitude.feedId,
                    this.mapWidget.config[this.configNamespace].latitude.sourceId,
                    this.mapWidget.config[this.configNamespace].latitude.channel + ',' + this.mapWidget.config[this.configNamespace].value.channel);
                break;

            }

        }

        // Return Deferred in case we need to wait for something at some point
        // return $.when();

    }

	LivePositionMapComponent.prototype.redraw = function () {
	};
	LivePositionMapComponent.prototype.destroy = function () {
        // Unregister old live-data connections
        this.evaLiveConnection.unregister(this.mapWidget.config[this.configNamespace].feedId,
            this.mapWidget.config[this.configNamespace].sourceId,
            this.mapWidget.config[this.configNamespace].latitude.channel);
        this.evaLiveConnection.unregister(this.mapWidget.config[this.configNamespace].feedId,
            this.mapWidget.config[this.configNamespace].sourceId,
            this.mapWidget.config[this.configNamespace].longitude.channel);
        this.evaLiveConnection.unregister(this.mapWidget.config[this.configNamespace].feedId,
            this.mapWidget.config[this.configNamespace].sourceId,
            this.mapWidget.config[this.configNamespace].value.channel);
        // Close connection
        this.evaLiveConnection.destroyStompClient();
	};

	// return our widget
	return LivePositionMapComponent;

});