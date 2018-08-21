define(['jquery', 'app/eva-api', 'd3',
		'css!styles/view/graph'],
	function ($, EvaApi, d3) {

		/**
		 * This widget shows a line graph.
		 */
		function HistoryLineGraph(selector, config) {

			// save selector for later reference
			this.selector = selector;

			// Add Graph DOM element
			this.graph = $('<div class="widget-body-graph"></div>');
			$(this.selector).append(this.graph);

			// set config from existing config or use default
			if (config) {
				this.config = config;

			} else {
				var now = new Date();
				// Default 10 Minute timeframe
				var tenMinutesAgo = new Date(now.getTime() - 10 * 60000);
				// Default config
				this.config = {
					line: {
						feedId: '',
						sourceId: '',
						channel: '',
						component: ''
					},
					firstTS: tenMinutesAgo.getTime(),
					lastTS: now.getTime(),
					aggregation: true
				}
			}

			// Initialize data array
			this.data = [];

			// Initialize diagram
			this.initDiagram();

			if (this.config.line.feedId && this.config.line.sourceId &&
				this.config.line.channel && this.config.line.component &&
				this.config.firstTS && this.config.lastTS) {

				// Download initial data

				var loader = $('<div class="loader"></div>');
				var body = $(this.selector).find('.widget-body').first();
				body.children().addClass('blurry');
				body.append(loader);

				EvaApi.fetchDataByTimespan(this.config.line.feedId,
					this.config.line.sourceId,
					this.config.line.channel,
					this.config.firstTS,
					this.config.lastTS,
					!this.config.aggregation)
					.then(function (data) {

						this.appendData(this.parseToD3jsFormat(data.data));

						loader.remove();
						body.children().removeClass('blurry');
					}.bind(this));

			}

		}

		/**
		 * Custom function to parse EveryAware data to D3js format
		 */
		HistoryLineGraph.prototype.parseToD3jsFormat = function (data) {
			var result = [];
			// Extract relevant data and timestamp
			for (var i = 0; i < data.length; i++) {

				result.push({
					date: new Date(data[i].timestamp),
					// convert to number with '+'
					value: +data[i].channels[this.config.line.channel][this.config.line.component]
				});
			}
			//sort results by time
			result.sort(function (a, b) {
				return a.date.getTime() - b.date.getTime();
			});
			return result;
		};


		HistoryLineGraph.prototype.setYBounds = function (data) {
			var yMin = d3.min(data, function (d) {
				return Math.min(d.value);
			});
			var yMax = d3.max(data, function (d) {
				return Math.max(d.value);
			});

			//increase the y-domain when yMin and yMax are the same so that
			// d3js can calculate a y scale
			if (yMin === yMax) {
				yMin--;
				yMax++;
			}

			if (!this.yMin || this.yMin >= yMin) {
				this.yMin = yMin;
			}

			if (!this.yMax || this.yMax < yMax) {
				this.yMax = yMax;
			}
		};

		HistoryLineGraph.prototype.rescaleX = function () {
			//rescale X Scale
			this.timeRangeX
				.domain([new Date(this.config.firstTS),
					new Date(this.config.lastTS)]);

			//rescale/pan xAxis
			this.xAxis.scale(this.timeRangeX);
			this.gX.call(this.xAxis);

			//rescale/pan the line/area
			this.shape.x(function (d) {
				return this.timeRangeX(d.date);
			}.bind(this));

			// Reset the transform of the d3js zoom behaviour
			// Otherwise the graph would jump somewhere as soon as it is clicked
			d3.select(this.svg).call(this.zoom.transform, d3.zoomIdentity);
		};

		HistoryLineGraph.prototype.rescaleY = function () {
			//rescale Y Scale
			this.setYBounds(this.data);

			this.valueRangeY
				.domain([this.yMin, this.yMax]);

			//rescale/pan yAxis
			this.yAxis.scale(this.valueRangeY);
			this.gY.call(this.yAxis);
		};

		HistoryLineGraph.prototype.initDiagram = function () {
			var margin = {
				left: 50,
				right: 30,
				top: 20,
				bottom: 30
			};
			var width = this.graph.width() - margin.left - margin.right
				, height = this.graph.height() - margin.top - margin.bottom;

			this.setYBounds(this.data);

			var timeRangeX = d3.scaleTime()
				.range([0, width])
				.domain([new Date(this.config.firstTS),
					new Date(this.config.lastTS)])
				, valueRangeY = d3.scaleLinear()
				.range([height, 0])
				.domain([this.yMin, this.yMax]);

			this.timeRangeX = timeRangeX;
			this.valueRangeY = valueRangeY;

			// Create x axis
			var xAxis = d3.axisBottom(timeRangeX)
			//get consistent spacing between ticks by binding the number of
			// ticks to the width divisor value is just an arbitrary guess that
			// seems to create a good-looking spacing between ticks
				.ticks(width / 60);

			this.xAxis = xAxis;

			// Create y axis
			var yAxis = d3.axisLeft(valueRangeY);

			this.yAxis = yAxis;

			// create svg root node with good old dom methods as it could
			// result in buggy behaviour otherwise
			this.svg = document.createElementNS("http://www.w3.org/2000/svg",
				"svg");

			var widgetId = $(this.selector).closest('.grid-stack-item')
				.attr('id');

			//append necessary svg elements so that the graph can be clipped
			// when it hits an axis
			d3.select(this.svg).append('defs').append('clipPath')
				.attr('id', 'clip-' + widgetId)
				.append('rect')
				.attr('width', width)
				.attr('height', height);

			var d3svg = d3.select(this.svg)
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom - 5) //-5
				// fixes
				// layout,
				// dunno
				// why
				// though
				.append("g")
				.attr("transform",
					"translate(" + margin.left + "," + margin.top + ")");

			//draw data as line
			this.shape = d3.line()
				.x(function (d) {
					return timeRangeX(d.date);
				})
				.y(function (d) {
					return valueRangeY(d.value);
				});

			this.path = d3svg.append('path')
				.attr('class', 'path-col-1')
				.attr('style', 'clip-path: url(#clip-' + widgetId + ');')
				.attr('d', this.shape(this.data))
				.attr("stroke-width", "2");

			// append axis
			var gX = d3svg.append("g")
				.attr("class", "axis axis--x")
				.attr("transform", "translate(0, " + (height) + ")")
				.call(xAxis);

			this.gX = gX;

			var gY = d3svg.append("g")
				.attr("class", "axis axis--y")
				.call(yAxis);

			this.gY = gY;

			// Add zoom behaviour
			this.zoom = d3.zoom()
				.on('zoom', zoomed.bind(undefined, this))
				.on('end', zoomEnd.bind(undefined, this));

			d3.select(this.svg).call(this.zoom);

			// Last step, as it reduces amount of page repaints
			this.graph.append(this.svg);
		};


		//zoomed scales and translates the graph
		function zoomed(widget) {
			var transform = d3.event.transform;

			//rescale/pan xAxis
			var newTimeRangeX = transform.rescaleX(widget.timeRangeX);
			widget.xAxis.scale(newTimeRangeX);
			widget.gX.call(widget.xAxis);

			//rescale/pan the line/area
			widget.shape.x(function (d) {
				return newTimeRangeX(d.date);
			});

			widget.path.attr('d', widget.shape(widget.data));

			return newTimeRangeX.domain();

		}

		//this downloads more data when zooming finished
		function zoomEnd(widget) {
			//handle scaling/translation and aquire new domain for X via zoomed
			var newXDomain = zoomed(widget);

			var loader = $('<div class="loader"></div>');
			var body = $(widget.selector).find('.widget-body').first();
			body.children().addClass('blurry');
			body.append(loader);

			EvaApi.fetchDataByTimespan(widget.config.line.feedId,
				widget.config.line.sourceId,
				widget.config.line.channel,
				newXDomain[0],
				newXDomain[1],
				!widget.config.aggregation).then(function (data) {
				//store new times
				widget.config.firstTS =
					new Date(newXDomain[0]).getTime();
				widget.config.lastTS =
					new Date(newXDomain[1]).getTime();

				//trigger dashboard upload so that the new config gets saved
				$(this).trigger('state:change');

				loader.remove();
				body.children().removeClass('blurry');

				widget.data = [];

				widget.appendData(this.parseToD3jsFormat(data.data));
			}.bind(widget));
		}

		HistoryLineGraph.prototype.getConfig = function () {
			return this.config;
		};

		HistoryLineGraph.prototype.getSelector = function () {
			return this.selector;
		};


		HistoryLineGraph.prototype.appendData = function (newData, rescaleX) {

			if (newData) {
				// Append new data to data array
				this.data = this.data.concat(newData);
			}

			//rescale Y and X scales
			this.rescaleY();
			if (rescaleX) {
				//when the redraw is triggered by a zoom, we don't want to
				// rescale X since it breaks zooming
				this.rescaleX();
			}

			// Redraw the line.
			this.path
				.attr('d', this.shape(this.data));

			return true;
		};

		/*
		 * These are some required life cycle functions.
		 * We don't need to implement anything more sophisticated for this simple widget.
		 * Other tutorials go into more detail.
		 */
		HistoryLineGraph.prototype.redraw = function () {
			this.graph.empty();
			this.initDiagram();
		};
		HistoryLineGraph.prototype.destroy = function () {
		};

		// return our widget
		return HistoryLineGraph;

	});