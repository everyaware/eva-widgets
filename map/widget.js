define(['jquery', 'app/config-view', 'css!./widget'], function ($, ConfigView) {

	/**
	 * This widget is for editing and displaying markdown.
	 */
	function Image(selector, config) {

		// save selector for later reference
        this.selector = selector;

        // this.image = $('<img width="100%" height="100%">');
        this.container = $('<div class="image-widget-container"></div>');
        this.imageContainer = $('<div class="image-widget-image-container"></div>');
        this.title = $('<div class="image-widget-title"></div>');
        this.slider = $('<input class="image-widget-slider" type="range" min="0" value="0">');
        this.container.append(this.imageContainer)
                      .append(this.title)
                      .append(this.slider);
        $(this.selector).append(this.container);
        
        if (config) {
            this.config = config;
            this.slider.attr('max', this.config.urls.length - 1);
            this.slider.attr('value', this.config.sliderPosition);
            this.title.text(this.config.titles[this.config.sliderPosition]);
            this.redraw();
        } else {
            this.config = {
                urls: [],
                titles: [],
                sliderPosition: 0
            };
            this.slider.attr('max', 0);
        }

        this.slider.on('input change', function (event) {
            this.config.sliderPosition = this.slider.val();
            this.redraw();
        }.bind(this));
	}

	Image.prototype.getConfig = function () {
		return this.config;
	}

	Image.prototype.getSelector = function () {
		return this.selector;
	}

	Image.prototype.renderConfigDialog = function (selector, callback) {
        var configStructure = [
            {
                id: 'urls',
                name: 'URLs',
                type: 'textarea',
                value: this.config.urls.join('\n')
            },
            {
                id: 'titles',
                name: 'Titles',
                type: 'textarea',
                value: this.config.titles.join('\n')
            }

            // https://i.redd.it/6o5wtc9qcli11.jpg
            // https://i.redditmedia.com/laKriC1wqBtFgSLMiYxu0KcyOwlM5CV3Kb1m4HOtZTY.png?fit=crop&crop=faces%2Centropy&arh=2&w=960&s=82515b2323407e38e6abf497d55925f3
            // https://i.redd.it/yi2pl1qyoji11.png
        ];

        ConfigView(selector,
            configStructure,
            function (newConfigStructure) {

                newConfigStructure.forEach(function (configEntry) {
                    this.config[configEntry.id] = configEntry.value.split('\n');
                }.bind(this));

                this.slider.attr('max', this.config.urls.length - 1);
            
                this.redraw();

                callback();
            }.bind(this));
	};

	/*
	 * These are some required life cycle functions. 
	 * We don't need to implement anything more sophisticated for this simple widget.
	 * Other tutorials go into more detail.
	 */
	Image.prototype.redraw = function () {
        var title = this.config.titles[this.config.sliderPosition];
        this.title.html(title ? title : '<br>');
        this.imageContainer.css('background-image', 'url("' + this.config.urls[this.config.sliderPosition] + '")');
	};
	Image.prototype.destroy = function () {
	};

	// return our widget
	return Image;

});