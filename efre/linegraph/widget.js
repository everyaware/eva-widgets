import HistoryLineGraph from 'graph.js';
import EvaApi from '../eva-api.js';

class LineGraph extends HTMLElement {
	constructor() {
		super();

		let shadowRoot = this.attachShadow({ mode: 'open' });
		shadowRoot.innerHTML = this.template;

		this.chart = new HistoryLineGraph(
			shadowRoot.getElementById('line-graph')
		);

		this.chart.onZoomEnd((begin, end) => {
			this.timestampBegin = begin;
			this.timestampEnd = end;

			return this.loadData();
		});

		// this.evaApi = new EvaApi('https://api.everyaware.eu');
		this.evaApi = new EvaApi('http://thorin:8082');
	}

	static get observedAttributes() {
		return [
			'width',
			'height',
			'feed',
			'source',
			'channel',
			'component',
			'timestamp-begin',
			'timestamp-end'
		];
	}

	get width() {
		return this.getAttribute('width');
	}

	get height() {
		return this.getAttribute('height');
	}

	get feed() {
		return this.getAttribute('feed');
	}

	get source() {
		return this.getAttribute('source');
	}

	get channel() {
		return this.getAttribute('channel');
	}

	get component() {
		return this.getAttribute('component');
	}

	get timestampBegin() {
		return this.getAttribute('timestamp-begin');
	}

	set timestampBegin(value) {
		return this.setAttribute('timestamp-begin', value);
	}

	get timestampEnd() {
		return this.getAttribute('timestamp-end');
	}

	set timestampEnd(value) {
		return this.getAttribute('timestamp-end', value);
	}

	get template() {
		return `
		<div id="line-graph" style="width: ${this.width}; height: ${
			this.height
		}; display: inline-block;"></div>
		`;
	}

	convertResponseToD3(data) {
		const result = [];
		// Extract relevant data and timestamp
		for (const i = 0; i < data.length; i++) {
			result.push({
				date: new Date(data[i].timestamp),
				// convert to number with '+'
				value: +data[i].channels[this.config.line.channel][
					this.config.line.component
				]
			});
		}
		//sort results by time
		result.sort(function(a, b) {
			return a.date.getTime() - b.date.getTime();
		});
		return result;
	}

	connectedCallback() {
		console.log('connectedCallback yey!');

		this.loadData().then(data => {
			this.chart.initDiagram(data);
		});
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log('attributeChangedCallback yey!');

		if (name == 'width' || name == 'height') {
			const container = this.shadowRoot.getElementById('line-graph');
			container.style[name] = newValue;

			this.chart.redraw();
		} else {
			this.loadData().then(data => this.chart.redraw(data));
		}
	}

	loadData() {
		return this.evaApi
			.fetchDataByTimespan(
				this.feed,
				this.source,
				this.channel,
				this.timestampBegin,
				this.timestampEnd,
				true
			)
			.then(
				function(response) {
					return this.convertResponseToD3(response);
				}.bind(this)
			);
	}

	disconnectedCallback() {
		console.log('disconnectedCallback yey!');
	}
}

window.customElements.define('line-graph', LineGraph);
