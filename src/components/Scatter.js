import React, {Component} from 'react'
import Waypoint from 'react-waypoint'
import * as d3 from 'd3'
import 'd3-selection-multi'
import { combine } from 'flubber'
import * as constants from "../constants"

const data = require('../data/scatter.json');

class Scatter extends Component {

	componentDidMount() {
		this.svg = d3.select('#base');
		this.duration = 800;
		this.lineY = 70;
		this.histogramHeight = 200;

		this.flattened = d3.values(data).reduce((currentArray, movies) => currentArray.concat(movies), []);

		this.box_office = this.flattened.map((d) => d.box_office_adj);
		this.budget = this.flattened.map((d) => d.budget_adj);

		let extentBoxOffice = d3.extent(this.box_office),
			extentBudget = d3.extent(this.budget);

		this.xScale = d3.scaleLinear()
			.domain([0, extentBoxOffice[1]])
			.range([20, 1220 - this.histogramHeight]);

		this.yScale = d3.scaleLinear()
			.domain([0, extentBudget[1]])
			.rangeRound([constants.bottom, 60 + this.histogramHeight]);

		this.xBins = d3.histogram()
			.domain(this.xScale.domain())
			.thresholds(7)(this.box_office);

		this.yBins = d3.histogram()
			.domain(this.yScale.domain())
			.thresholds(10)(this.budget);

		this.xHistHeights = d3.scaleLinear()
			.domain([0, d3.max(this.xBins, (d) => d.length)])
			.range([this.histogramHeight - 40, 1])

		this.yHistWidths = d3.scaleLinear()
			.domain([0, d3.max(this.yBins, (d) => d.length)])
			.range([1, this.histogramHeight - 40])

		this.tweenDash = function(dashSize, gapSize) {
			let i = d3.interpolateString('0,0', `${dashSize},${gapSize}`);
			return function(t) { return i(t); };
		}

		let animations = [
			{function: this.shiftLine, delay: 11000},
		];

		let waypointTops = this.node.selectAll(".waypoint").nodes()
			.map((d) => d.getBoundingClientRect().top < document.body.offsetHeight/2);

		(function callAnimations(i) {
			if (!waypointTops[i] || i >= animations.length) {
				return;
			}

			setTimeout(function() {
				animations[i].function();
				callAnimations(i+1);
			}, animations[i].delay);
		})(0);
	}

	shiftLine = () => {
		if (this.props.step !== constants.steps.SCATTER_SCALE) {
			return;
		}
		this.props.incrementStep();

		let that = this;

		d3.selectAll('.quantity').transition()
			.attr('opacity', 0)
			.on('end', function(d) {
				d3.select(this).remove();
			});

		d3.selectAll('circle').transition().duration(this.duration)
			.attrs({
				cy: this.lineY,
				cx: function(d) { return +d3.select(this).attr('cx')},
				r: 10,
				'stroke-width': 3
			});

		d3.selectAll('.decade').transition().duration(this.duration)
			.ease(d3.easeQuadOut)
			.attrs({
				y: this.lineY,
				x: function(d) { return +d3.select(this).attr('x')},
				opacity: 0,
				'font-size': '1.25rem'
			})
			.on('end', function() {
				d3.select(this).transition()
					.attrs({
						y: that.lineY - 20,
						opacity: 1
					});
			});

		d3.selectAll('path').transition().duration(this.duration)
			.attrs({
				'stroke-width': 10,
				d: function(d) {
					let oldPath = d3.select(this).attr('d').split(' ').map((d) => {
						let coordSplit = d.split(',');
						coordSplit[0] = +coordSplit[0].slice(1);
						return coordSplit;
					});
					return `M${oldPath[0][0]},${that.lineY} L${oldPath[1][0]},${that.lineY}`;
				},
			})
			.on('end', function(d) {
				d3.select(this).transition().duration(that.duration/10)
					.delay((that.duration * (10-(2010-d) / 10)) / 10)
					.attrTween('stroke-dasharray', that.tweenDash.bind(this, 10, 6));
			});

		setTimeout(this.createAxes, this.duration);
	}

	createAxes = () => {
		let format = (d) => d/1000000 + "M";
		let xAxis = d3.axisBottom(this.xScale).tickFormat(format);
		let yAxis = d3.axisLeft(this.yScale).tickFormat(format);

		this.chart = this.svg.append('g')
			.classed('chart', true)
			.attrs({
				transform: 'scale(0,0)',
				opacity: 0
			});

		this.chart.append("g")
			.attr('transform', `translate(0,${constants.bottom})`)
			.call(xAxis);

		this.chart.append("g")
			.attr('transform', 'translate(20,0)')
			.call(yAxis);

		this.chart.transition().duration(this.duration)
			.attrs({
				transform: '',
				opacity: 1
			})
			.on('end', () => this.drawScatterHist());

	}


	drawScatterHist = () => {
		if (this.props.step !== constants.steps.SCATTER_PLOT) {
			return;
		}
		this.props.incrementStep();

		let colorTenKey = d3.keys(constants.colors).reduce((current, shade) =>
			current.concat(d3.keys(constants.colors[shade]).map((hue) => [shade, hue])), []);

		colorTenKey.shift();

		let drawHist = () => {
			let xHistogram = this.svg.append('g')
				.attr('class', 'histogram hist-x')
				.attr('transform', 'translate(-60, 60)');

			xHistogram.selectAll('rect')
				.data(this.xBins)
				.enter().append('rect')
				.attrs({
					class: 'bar',
					x: (d) => this.xScale(d.x0),
					y: (d) => this.histogramHeight - this.xHistHeights(d.length),
					width: (d) => (this.xScale(d.x1) - this.xScale(d.x0) - 2),
					height: (d) => this.xHistHeights(d.length),
					fill: constants.colors.BLUE.LIGHTEN
				});

			let yHistogram = this.svg.append('g')
				.attr('class', 'histogram hist-y')
				.attr('transform', `translate(${this.xScale.range()[1] - 60}, ${this.yScale.range()[0]-10})`);

			yHistogram.selectAll('rect')
				.data(this.yBins)
				.enter().append('rect')
				.attrs({
					class: 'bar',
					x: 0,
					y: (d) => this.histogramHeight - this.yScale(d.x1),
					width: (d) => this.yHistWidths(d.length),
					height: (d) => (this.yScale(d.x0) - this.yScale(d.x1) - 2),
					fill: constants.colors.BLUE.LIGHTEN
				});
		}

		let drawScatter = () => {
			let points = this.chart.selectAll('circle')
				.data(this.flattened).enter()
				.append('circle')
				.attrs({
					cx: (d) => this.xScale(d.box_office_adj),
					cy: (d) => this.yScale(d.budget_adj),
					r: 9,
					fill: (d) => {
						let key = colorTenKey[(+d.decade - 1920)/10];
						return constants.colors[key[0]][key[1]];
					},
					opacity: 0,
					stroke: constants.colors.SHADES.BLACK,
					'stroke-width': '0.5px',
					'class': (d) => `node ${d.decade}`
				});

			points.transition().delay((d) => (+d.decade-1920) * 100)
				.duration(1000)
				.attrs({
					opacity: 0.8
				})
		}

		drawScatter();

	}


  render() {
    return (
		<section ref={(node) => { this.node = d3.select(node); }}>
			<div className="card">
				<div className="card-content">
					<Waypoint onEnter={this.shiftLine} bottomOffset={constants.waypointTriggerHeight}><span className="waypoint"/></Waypoint>
					<p>
						Knowing how many actors there were and finding that concentration of big names in the 30s and 40s piqued my interest into looking at the ratio of actors to movies per decade. This chart shows much better decades where more actors and actresses were starring in multiple movies.
					</p>
				</div>
			</div>
		</section>
    )
  }
}

export default Scatter
