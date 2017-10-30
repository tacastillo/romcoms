import React, {Component} from 'react'
import Waypoint from 'react-waypoint'
import * as d3 from 'd3'
import 'd3-selection-multi'
import { combine } from 'flubber'
import * as constants from "../constants"

const data = require('../data/ratios.json');

class RatioLine extends Component {

	componentDidMount() {
		this.svg = d3.select('#base');
		this.bottom = 1000;

		let max = d3.max(Object.keys(data), (d) => +data[d].length);
		this.decades = Object.keys(data);

		this.xScale = d3.scaleBand()
			.domain(this.decades)
			.range([60, 1220]);

		this.yScale = d3.scaleLinear()
			.domain([0, +max])
			.rangeRound([this.bottom, 120]);

		this.line = d3.line()
			.x((d) => this.xScale(d))
			.y((d) => this.yScale(data[d].length));

		let animations = [
			{function: this.toLine, delay: 9000},
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

	toLine = () => {
		if (this.props.step !== constants.steps.LINE_RATIO) {
			return;
		}
		this.props.incrementStep();
		let topPaths = [];
		let duration = 1000;
		let that = this;

		this.svg.selectAll('circle')
			.data(this.decades).enter()
			.append('circle')
			.attrs({
				cx: (d) => this.xScale(d),
				cy: -25,
				r: 30,
				fill: constants.colors.SHADES.WHITE,
				stroke: constants.colors.BLUE.DARKEN,
				'stroke-width': 8
			})
			.transition().duration(duration)
				.attr('cy', (d) => this.yScale(data[d].length));

		for (let i = 0; i < this.decades.length - 1; i++) {
			let d1 = this.decades[i],
				d2 = this.decades[i+1],
				line = this.line([d1, d2]).split('L');

			let endpoint = line[1].split(',');
			line[1] = [+endpoint[0] + 1, endpoint[1]].join(',');

			topPaths.push([line[0].slice(1), 'L' + line[1]]);
		}

		let bars = d3.selectAll('path');
		bars.each(function(d, i) {
			let bar = d3.select(this);
			let text = d3.select(`.text-${that.decades[i]} .quantity`);

			text.transition().duration(duration * 0.3)
				.attr('fill-opacity', 0);

			if (i === bars.size() - 1) {
				bar.transition().duration(duration)
					.attrs({
						transform: 'translate(50, 0)',
						opacity: 0
					})
					.on('end', () => {
						text.transition().duration(duration)
							.attr('fill-opacity', 1)
						bar.remove();
					});
			}
			else {
				let topPath = topPaths[i];
				let [topLeft, topRight, bottomRight, bottomLeft]  = bar.attr('d').split(' ').map((coord) => coord.split(','));
				let [x1, x2] = [0, 1,].map((i) => topPath[i].split(',')[0]);

				let newBottomRight = `${x2},${bottomRight[1]}`;
				let newBottomLeft = `${x1},${bottomLeft[1]}`;

				let newPath = ['M' + topPath[0], topPath[1], newBottomRight, newBottomLeft].join(' ');

				bar.transition().duration(duration)
					.attrs({
						d: [`M${topPath[0]}`, topPath[1], topPath[1],`L${topPath[0]}Z`].join(' '),
						stroke: constants.colors.BLUE.DARKEN,
						'stroke-width': '5px'
					})
					.on('end', () => {
						text.transition().duration(duration)
							.attr('fill-opacity', 1)
						bar.transition().duration(duration)
							.attrs({
								'stroke-width': '20px'
							});
					});
			}
			let numFormat = d3.format('.1f');

			d3.select(text.node().parentNode).raise();
			text.attrs({
				y: +that.yScale(data[d].length) + 10,
				x: text.attr('x') - 2,
				'font-size': '1.5rem',
			});
			text.transition().duration(duration)
				.tween("text", () => {
					let i = d3.interpolate(+text.text(), data[d].length);
					return function(t) {
						text.text(numFormat(i(t)));
					};
				});
		});
	}

  render() {
    return (
		<section ref={(node) => { this.node = d3.select(node); }}>
			<div className="card">
				<div className="card-content">
					<Waypoint onEnter={this.toLine} bottomOffset={constants.waypointTriggerHeight}><span className="waypoint"/></Waypoint>
					<p>
						Knowing how many actors there were and finding that concentration of big names in the 30s and 40s piqued my interest into looking at the ratio of actors to movies per decade. This chart shows much better decades where more actors and actresses were starring in multiple movies.
					</p>
				</div>
			</div>
		</section>
    )
  }
}

export default RatioLine
