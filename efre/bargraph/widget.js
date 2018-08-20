import 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.min.js';
import EvaApi from '../eva-api.js';

class BarChart extends HTMLElement {
	constructor() {
		super();

		let shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = this.template;

		// this.evaApi = new EvaApi('https://api.everyaware.eu');
		this.evaApi = new EvaApi('http://thorin:8082');
		let now = new Date();
		let lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		this.evaApi.fetchDataByTimespan('test', 'testSource', 'channelA', lastWeek, now, true)
			.then(function (response) {
				console.log(response);
			});
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

	get template() {
		return `
		<div id="container" style="width: ${this.width}; height: ${this.height}; display: inline-block;">
			<canvas id="myChart"></canvas>
		</div>
		`;
	}

	connectedCallback() {
		console.log("connectedCallback yey!")

		const ctx = this.shadowRoot.getElementById("myChart").getContext('2d');
		this.chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
				datasets: [{
					label: '# of Votes',
					data: [12, 19, 3, 5, 2, 3]
				}]
			},
			options: {
				maintainAspectRatio: false,
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero:true
						}
					}]
				}
			}
		});

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