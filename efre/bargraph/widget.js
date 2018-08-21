import 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.min.js';
import EvaApi from '../eva-api.js';

class BarChart extends HTMLElement {
	constructor() {
		super();

		let shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = this.template;

		// this.evaApi = new EvaApi('https://api.everyaware.eu');
		this.evaApi = new EvaApi('http://thorin:8082');
	}

	static get observedAttributes() {
		return ['width', 'height', 'feed', 'source', 'channel', 'component', 'first-timestamp', 'last-timestamp'];
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

	get template() {
		return `
		<div id="container" style="width: ${this.width}; height: ${this.height}; display: inline-block;">
			<canvas id="myChart"></canvas>
		</div>
		`;
	}

	convertResponseToChartjs(response) {
		let data = [];
		for(let packet of response['data']) {
			data.push({
				x: new Date(packet['timestamp']),
				y: packet['channels'][this.channel][this.component]
			});
		}

		return data;
	}

	initChart(initialData) {
		
		const ctx = this.shadowRoot.getElementById("myChart").getContext('2d');

		this.chart = new Chart(ctx, {
			type: 'line',
			data: initialData,
			options: {
				maintainAspectRatio: false,
				scales: {
					// yAxes: [{
					// 	ticks: {
					// 		beginAtZero:true
					// 	}
					// }],
					xAxes: [{
						type: 'time',
						time: {
							unit: 'month'
						}
					}]
				}
			}
		});
	}

	connectedCallback() {
		console.log("connectedCallback yey!")

		let now = new Date();
		let lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		this.evaApi.fetchDataByTimespan(this.feed, this.source, this.channel, lastWeek, now, true)
			.then(function (response) {
				console.log(response);

				const data = this.convertResponseToChartjs(response);

				console.log(data);
				this.initChart(data);
				

			}.bind(this));

	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log('attributeChangedCallback yey!');

		if (name == "width" || name == "height") {
			const container = this.shadowRoot.getElementById("container");
			container.style[name] = newValue;

			if (this.chart) {
				this.chart.resize();
			}
		}

	}
	
	disconnectedCallback() {
		console.log('disconnectedCallback yey!');
	}
};

window.customElements.define('bar-chart', BarChart);