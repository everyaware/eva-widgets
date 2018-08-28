define(['jquery', 'app/config-view', 'css!./widget'], function ($, ConfigView) {

	/**
	 * This widget is for displaying images.
	 */
	function Image(selector, config) {

		// save selector for later reference
        this.selector = selector;

        this.separator = ' ; ';

        // this.image = $('<img width="100%" height="100%">');
        this.container = $('<div class="image-widget-container"></div>');
        this.imageContainer = $('<div class="image-widget-image-container"></div>');
        this.sliderContainer = $('<div class="image-widget-slider-container"></div>');
        this.title = $('<div class="image-widget-title"></div>');
        this.slider = $('<input class="image-widget-slider" type="range" min="0" value="0">');
        this.sliderContainer.append(this.title)
                            .append(this.slider);
        this.container.append(this.imageContainer)
                      .append(this.sliderContainer);
        $(this.selector).append(this.container);
        
        if (config) {
            this.config = config;
            this.slider.attr('max', this.config.images.length - 1);
            this.slider.val(this.config.sliderPosition);
            this.title.text(this.config.images[this.config.sliderPosition]['title']);
        } else {
            this.config = {
                images: [],
                sliderPosition: 0
            };
            this.slider.attr('max', 0);
            this.slider.hide();
        }

        this.redraw();

        this.slider.on('input change', function (event) {
            this.config.sliderPosition = this.slider.val();
            $(this).trigger('state:change');
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
                id: 'images',
                name: 'Images (title' + this.separator + 'url)',
                type: 'textarea',
                value: this.config.images.map(function (image) {
                    return image.title + this.separator + image.url;
                }.bind(this)).join('\n')
            }

            // https://i.redd.it/6o5wtc9qcli11.jpg
            // https://i.redditmedia.com/laKriC1wqBtFgSLMiYxu0KcyOwlM5CV3Kb1m4HOtZTY.png?fit=crop&crop=faces%2Centropy&arh=2&w=960&s=82515b2323407e38e6abf497d55925f3
            // https://i.redd.it/yi2pl1qyoji11.png
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
                            title: elements[0].trim(),
                            url: elements[1].trim()
                        };
                    }.bind(this));
                }.bind(this));

                this.slider.attr('max', this.config.images.length - 1);
                this.config.sliderPosition = 0;

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

        if (this.config.images.length === 0) {
            return;
        }

        var title = this.config.images[this.config.sliderPosition]['title'];
        this.title.html(title ? title : '<br>');

        this.slider.val(this.config.sliderPosition);             	

        if (this.config.images.length <= 1) {
            this.slider.hide();
        } else {
            this.slider.show();
        }

        this.imageContainer.css('background-image', 'url("' + this.config.images[this.config.sliderPosition]['url'] + '")');
	};
	Image.prototype.destroy = function () {
	};

	// return our widget
	return Image;

});