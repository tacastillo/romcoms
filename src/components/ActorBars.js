import React, {Component} from 'react'
import Waypoint from 'react-waypoint'
import * as d3 from 'd3'
import 'd3-selection-multi'

import * as constants from "../constants"

const data = require('../data/actor-decades.json');

class ActorBars extends Component {

	componentDidMount() {
		this.svg = d3.select('#base');
		this.bottom = 1000;

		let max = d3.max(Object.keys(data), (d) => +data[d].length);

		this.yScale = d3.scaleLinear()
			.domain([0, +max])
			.rangeRound([1000, 120]);

		let animations = [
			{function: this.mergeBoxes, delay: 5500},
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

	mergeBoxes = () => {
		if (this.props.step !== constants.steps.BARS_ACTOR) {
			return;
		}
		this.props.incrementStep();

		let baseHeight = "1100";
		for (let decade of Object.keys(data)) {
			let boxes = d3.selectAll(`.box-${decade}`);
			let size = boxes.size();
			let pendingTransitions = 0;
			let newPaths = [];
			boxes.each(function(box, i) {
				let d = d3.select(this).attr('d');
				if (i === size-1) {
					newPaths.push(d);
				} else {
					newPaths.push(extendPath(d));
				}
			});

			boxes.transition().duration(500)
				.each(() => {
					pendingTransitions++;
				})
				.attr('d', (d, i) => newPaths[i])
				.on('end', (d) =>{
					pendingTransitions--;
					if (pendingTransitions === 0) {
						this.changeBars(boxes);
					}
				});

		}

		function extendPath(d) {
			let split = d.split(" ");
			let newPath = split.map((point, i) => {
				if (i > 1) {
					return point;
				}

				let coords = point.split(",");

				let splitCoords = {
					pre: point[0],
					x: +coords[0].slice(1),
					y: +coords[1].split("Z")[0] - 11,
					post: point.indexOf("Z") >=0
				};
				return splitCoords.pre + splitCoords.x + "," + splitCoords.y + (splitCoords.post ? "Z" : "");
			}).join(" ");
			return newPath;
		}
	}

	changeBars = (boxes) => {
		let decade = boxes.datum();
		let delay = 1500 - ((2010 - +decade) / 10) * 150;
		let topPoints = boxes.filter((d, i) => i === boxes.size()-1).attr('d')
			.split(' ').slice(0,2).join(" ");
		let bottomPoints = boxes.filter((d, i) => i === 0).attr('d')
			.split(' ').slice(2,4).join(" ");

		let numFormat = d3.format('d');

		let bar = this.svg.append('path')
			.classed('bar', true)
			.data([decade])
			.attrs({
				fill: constants.colors.BLUE.DARKEN,
				opacity: 0,
				d: [topPoints, bottomPoints].join(' ')
			});

		let resizeBar = (path) => {
			let [topLeft, topRight, ...bottom] = path.split(' ').map((d) => d.split(','));
			let height = this.yScale(+data[decade].length);
			return [
				`${topLeft[0]},${height}`,
				`${topRight[0]},${height}`,
				bottom.join(' ')
			].join(' ');
		}

		bar.transition().duration(400)
			.delay(delay)
			.attr('opacity', 1)
			.on('end', () => {
				let length = +data[decade].length;

				boxes.remove();

				bar.transition().duration(600)
					.attr('d', resizeBar(bar.attr('d')));

				let quantity = d3.select(`.text-${decade} .quantity`);
				quantity.transition().duration(600)
					.attr('y', this.yScale(length) - 5)
					.tween("text", () => {
						let i = d3.interpolate(+quantity.text(), length);
						return function(t) {
							quantity.text(numFormat(i(t)));
						};
					});
			});
	}

  render() {
    return (
		<section ref={(node) => { this.node = d3.select(node); }}>
			<div className="card">
				<div className="card-content">
					<Waypoint onEnter={this.mergeBoxes} bottomOffset={constants.waypointTriggerHeight}><span className="waypoint"/></Waypoint>
					<p>
						With that burst of movies in the 00s and early 10s, we saw many actors and actresses come and go. This led me to question how many celebrities were really involved with the romcom genre.
					</p>
					<p>
						Interestingly enough, there was a dip in the 30s and 40s when certain stars took over Hollywood. The stars from these decades include names like Gene Kelly, Judy Garland, Lucille Ball and Bing Crosby.
					</p>
				</div>
			</div>
		</section>
    )
  }
}

export default ActorBars
