import '../styles/MovieBars.scss'

import React, {Component} from 'react'
import Waypoint from 'react-waypoint'
import * as d3 from 'd3'
import 'd3-selection-multi'
import { interpolate } from 'flubber'

import * as constants from "../constants"

const steps = {
  BOX: 0,
  BAR: 1,
  BAR_CHART: 2
};

class MovieBars extends Component {

  componentDidMount() {
    this.step = 0;
    this.bottom = 700;

    this.boxPath = "M0,0 L80,0 L80,100 L0,100Z";

    this.svg = d3.select("#base")
      .classed("title-box", true);

    this.svg.append("path")
      .classed("box", true)
      .attr("fill", constants.colors.BLUE)
      .attr('d', this.boxPath)
      .attr('transform', `translate(${600},${this.bottom})`)
  }

  drawFirstLabels = () => {
    if (this.step === steps.BOX) {
      this.step++;

      this.labels = this.svg.append("g")
        .attr('opacity', 0);

      let x = 590,
          y = this.bottom - 10

      this.labels.append("text")
        .attrs({
          x: x,
          y: y,
          id: 'box-quantity',
          'text-anchor': 'middle'
        })
        .text("37");


      this.labels.append("text")
        .attrs({
          x: x,
          y: y + 145,
          id: 'box-decade',
          'text-anchor': 'middle'
        })
        .text("1910");


      this.labels.transition().duration(1000)
        .attrs({
          opacity: 1,
          transform: "translate(50,0)"
        });
    }
  }

  build2010Bar = () => {
    if (this.step === steps.BAR) {
      this.step++;

      let numFormat = d3.format('d');
      let numBoxes = parseInt(175 / 37);
      let remainder = ((175 % 37) / 37).toFixed(2);
      let i = 0;

      for (i in d3.range(numBoxes)) {
        let box = this.svg.append("path")
          .classed("box", true)
          .attrs({
            fill: constants.colors.BLUE,
            opacity: 0,
            d: this.boxPath,
            transform: `translate(${600},${this.bottom - ((+i)+1)*110})`,
          });
      }

      i++;

      let box = this.svg.append("path")
        .classed("box", true)
        .attrs({
          fill: constants.colors.BLUE,
          opacity: 0,
          d: this.boxPath,
          transform: `translate(${600},${this.bottom - (i+1)*110}) scale(1,${remainder})`,
          'transform-origin': 'bottom'
        });

      this.labels.select('#box-decade')
        .transition().duration(1000)
        .tween("text", () => tweenNumberLabels(2010, '#box-decade'))

      this.labels.select("#box-quantity")
        .transition().duration(i * 200)
        .ease(d3.easeLinear)
        .attr('transform', `translate(0, -${(i+(remainder/1))*110})`)
        .tween("text", () => tweenNumberLabels(175, '#box-quantity'));

      d3.selectAll('.box').transition()
        .delay((d,i) => i * 200)
        .duration(200)
        .attr('opacity', 1)

      function tweenNumberLabels(endNumber, id) {
        var that = d3.select(id);
        let i = d3.interpolate(that.text(), endNumber);
        return function(t) {
          that.text(numFormat(i(t)));
        };
      }
    }
  }

  render() {
    return [
      <div className="card" key="1">
        <div className="card-content">
          <Waypoint onEnter={this.drawFirstLabels} bottomOffset="40%"/>
          <p>
            According to Wikipedia, the first romantic comedy was a silent film called "Courting Across the Court" and was released in theaters in 1911.
          </p>
          <p>
          Over the next decade, the slowly blossoming genre grew to have 37 titles in cinema.
          </p>
        </div>
      </div>,
      <div className="card" key="2">
        <div className="card-content">
          <Waypoint onEnter={this.build2010Bar} bottomOffset="40%"/>
          <p>
            However, between 2010 and 2017, 175 romantic comedies were shown in theaters.
          </p>
        </div>
      </div>
    ]
  }
}

export default MovieBars
