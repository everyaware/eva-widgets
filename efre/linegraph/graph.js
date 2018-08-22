import d3 from 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.6.0/d3.min.js';

/**
 * This widget shows a line graph.
 */
class HistoryLineGraph{
	
	constructor(parentNode, dataLoader, firstTs, lastTs) {

		this.parentNode = parentNode;
		this.dataLoader = dataLoader;
		this.firstTs = firstTs;
		this.lastTs = lastTs;


		// Add Graph DOM element
		this.graph = document.createElement('div');
		this.graph.classList.add('widget-body-graph');

		parentNode.appendChild(this.graph);

		// Initialize data array
		this.data = [];
	}

	setBounds(data) {
		const yMin = d3.min(data, function (d) {
			return Math.min(d.value);
		});
		const yMax = d3.max(data, function (d) {
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
	}

	rescaleX() {
		//rescale X Scale
		this.timeRangeX
			.domain([new Date(this.firstTs),
				new Date(this.lastTs)]);

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
	}

	rescaleY() {
		//rescale Y Scale
		this.setYBounds(this.data);

		this.valueRangeY
			.domain([this.yMin, this.yMax]);

		//rescale/pan yAxis
		this.yAxis.scale(this.valueRangeY);
		this.gY.call(this.yAxis);
	}

	async initDiagram() {

		this.data = await this.dataLoader(this.firstTs, this.lastTs);

		const margin = {
			left: 50,
			right: 30,
			top: 20,
			bottom: 30
		};
		const width = this.graph.width() - margin.left - margin.right,
			height = this.graph.height() - margin.top - margin.bottom;

		this.setYBounds(this.data);

		const timeRangeX = d3.scaleTime()
			.range([0, width])
			.domain([new Date(this.firstTs),
				new Date(this.lastTs)])
			, valueRangeY = d3.scaleLinear()
			.range([height, 0])
			.domain([this.yMin, this.yMax]);

		this.timeRangeX = timeRangeX;
		this.valueRangeY = valueRangeY;

		// Create x axis
		const xAxis = d3.axisBottom(timeRangeX)
		//get consistent spacing between ticks by binding the number of
		// ticks to the width divisor value is just an arbitrary guess that
		// seems to create a good-looking spacing between ticks
			.ticks(width / 60);

		this.xAxis = xAxis;

		// Create y axis
		const yAxis = d3.axisLeft(valueRangeY);

		this.yAxis = yAxis;

		// create svg root node with good old dom methods as it could
		// result in buggy behaviour otherwise
		this.svg = document.createElementNS("http://www.w3.org/2000/svg",
			"svg");

		//append necessary svg elements so that the graph can be clipped
		// when it hits an axis
		d3.select(this.svg).append('defs').append('clipPath')
			.attr('id', 'd3-clip-path')
			.append('rect')
			.attr('width', width)
			.attr('height', height);

		const d3svg = d3.select(this.svg)
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
			.attr('style', 'clip-path: url(#d3-clip-path);')
			.attr('d', this.shape(this.data))
			.attr("stroke-width", "2");

		// append axis
		const gX = d3svg.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0, " + (height) + ")")
			.call(xAxis);

		this.gX = gX;

		const gY = d3svg.append("g")
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
	}


	//zoomed scales and translates the graph
	zoomed(widget) {
		const transform = d3.event.transform;

		//rescale/pan xAxis
		const newTimeRangeX = transform.rescaleX(widget.timeRangeX);
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
	async zoomEnd(widget) {
		//handle scaling/translation and aquire new domain for X via zoomed
		const newXDomain = zoomed(widget);

		this.firstTs = newXDomain[0];
		this.lastTs = newXDomain[1];

		// INSERT LOAD MORE CALLBACK HERE
		const data = await this.dataLoader(this.firstTs, this.lastTs);

		this.data = [];

		this.appendData(data);
	}

	setDataLoader(fnt) {
		this.dataLoader = fnt;
	}

	get config() {
		return this.config;
	}

	get parentNode() {
		return this.parentNode;
	}

	appendData(newData, rescaleX) {

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
	}

	/*
	* These are some required life cycle functions.
	* We don't need to implement anything more sophisticated for this simple widget.
	* Other tutorials go into more detail.
	*/
	redraw(data) {
		this.graph.empty();
		this.initDiagram(data);
	};

}

export default HistoryLineGraph;