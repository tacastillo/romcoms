import '../styles/MovieBars.scss'

import React, {Component} from 'react'
import Waypoint from 'react-waypoint'
import * as d3 from 'd3'
import 'd3-selection-multi'
import { interpolate } from 'flubber'

import * as constants from "../constants"

const data = require('../data/decades.json');

const steps = {
  BOX: 0,
  BAR: 1,
  BARS: 2
};

class MovieBars extends Component {

  componentDidMount() {
    this.step = 0;
    this.bottom = 1000;
    this.boxPath = "M0,0 L80,0 L80,100 L0,100Z";

    this.xScale = d3.scaleBand()
      .domain(Object.keys(data))
      .rangeRound([20, 1180])

    this.xCenter = this.xScale(1960);

    this.svg = d3.select("#base")
      .classed("title-box", true);

    this.appendBox({
      d: this.boxPath,
      fill: constants.colors.BLUE,
      transform: `translate(${this.xCenter},${this.bottom})`
    })

    let animations = [
        {function: this.drawFirstLabels, delay: 0},
        {function: this.draw2010Bar, delay: 1000},
        {function: this.drawBars, delay: 1200}
    ];

    let unit = data[1910].length;
    this.boxData = Object.keys(data).map((i) => {
      let len = data[i].length;
      return {
        decade: i,
        length: len,
        remainder: +((len % unit) / unit).toFixed(2),
        numBoxes: parseInt(len / unit)
      }
    });

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

  drawFirstLabels = () => {
    if (this.step !== steps.BOX) {
      return;
    }
    this.step++;

    let x = this.xCenter,
        y = this.bottom - 10;

    this.labels = this.svg.append("g")
      .attr('opacity', 0);

    this.labels.append("text")
      .attrs({
        x: x - 10,
        y: y,
        id: 'box-quantity',
        'text-anchor': 'middle'
      })
      .text("37");

    this.labels.append("text")
      .attrs({
        x: x - 10,
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

  draw2010Bar = () => {
    if (this.step !== steps.BAR) {
      return;
    }
    this.step++;

    let {numBoxes, remainder, length, decade} = this.boxData[this.boxData.length-1];

    let numFormat = d3.format('d');
    let i = 0;

    for (i in d3.range(numBoxes)) {
      this.appendBox({
        fill: constants.colors.BLUE,
        opacity: 0,
        d: this.boxPath,
        transform: `translate(${this.xCenter},${this.bottom - ((+i)+1)*110})`,
      });
    }

    i++;

    this.appendBox({
      fill: constants.colors.BLUE,
      opacity: 0,
      d: this.boxPath,
      transform: `translate(${this.xCenter},${this.bottom-(i+1)*110+(1-remainder)*100}) scale(1,${remainder})`,
    });

    this.labels.select('#box-decade')
      .transition().duration(1000)
      .tween("text", () => tweenNumberLabels(decade, '#box-decade'))

    this.labels.select("#box-quantity")
      .transition().duration(i * 200)
      .ease(d3.easeLinear)
      .attr('transform', `translate(0, -${(i+(remainder/1))*110})`)
      .tween("text", () => tweenNumberLabels(length, '#box-quantity'));

    function tweenNumberLabels(endNumber, id) {
      var that = d3.select(id);
      let i = d3.interpolate(that.text(), endNumber);
      return function(t) {
        that.text(numFormat(i(t)));
      };
    }

    d3.selectAll('.box').transition()
      .delay((d,i) => i * 200)
      .duration(200)
      .attr('opacity', 1)
  }

  drawBars = () => {
    if (this.step !== steps.BARS) {
      return;
    }
    this.step++;

    let allSVGElements = this.svg.selectAll("*")
      .filter(function(d, i) { return this.tagName != "g"});

    let xEnd = this.xScale(2010) - this.xCenter;

    allSVGElements.each(function(data, i) {
      let selection = d3.select(this);
      let transform = `${selection.attr('transform') || ""} translate(${xEnd},0)`;
      selection.transition().duration(1000)
        .attr('transform', transform);
    });

    setTimeout(() => {
      for (let j in d3.range(this.boxData.length - 1)) {
        let bar = this.boxData[j];
        let newLabels = this.svg.append("g")
          .attr('opacity', 1);

        let x = this.xScale(+bar.decade);
        let i = 0;

        newLabels.append("text")
          .attrs({
            x: x + 40,
            y: this.bottom - 15 - (((bar.numBoxes-1)+(bar.remainder/1))*110),
            opacity: 0,
            'text-anchor': 'middle'
          })
          .text(bar.length);

        newLabels.append("text")
          .attrs({
            x: x + 40,
            y: this.bottom + 135,
            opacity: 0,
            'text-anchor': 'middle'
          })
          .text(bar.decade);

        for (i in d3.range(bar.numBoxes)) {
          this.appendBox({
              fill: constants.colors.BLUE,
              opacity: 0,
              d: this.boxPath,
              transform: `translate(${x},${this.bottom - i*110})`,
            });
        }

        if (bar.numBoxes > 1) {
          i++;
        }

        this.appendBox({
          fill: constants.colors.BLUE,
          opacity: 0,
          d: this.boxPath,
          transform: `translate(${x},${this.bottom - (+(i))*110 + (1-bar.remainder)*100}) scale(1,${bar.remainder})`,
        });
      }

      let xRange = this.xScale.domain().map((d) => this.xScale(d));
      let that = this;
      d3.selectAll('.box').transition()
        .delay(function(d,i) {
          let stringTransform = d3.select(this).attr('transform');
          let x = +stringTransform.substring(stringTransform.indexOf("(")+1, stringTransform.indexOf(")")).split(",")[0];
          return 2000 - ((xRange.indexOf(x)) * 200);
        })
        .duration(400)
        .attr('opacity', 1)

      d3.selectAll('text').transition()
        .delay(function(d,i) {
          let x = (+d3.select(this).attr('x')) - 40;
          return 2000 - ((xRange.indexOf(x)) * 200);
        })
        .duration(400)
        .attr('opacity', 1);
    }, 1000);
  }

  appendBox = (attrs) => {
    this.svg.append("path")
      .classed("box", true)
      .attrs(attrs);
  }

  render() {
    return (
      <section ref={(node) => { this.node = d3.select(node); }}>
        <div className="card">
          <div className="card-content">
            <Waypoint id="uh" onEnter={this.drawFirstLabels} bottomOffset="40%"><span className="waypoint"/></Waypoint>
            <p>
              According to Wikipedia, the first romantic comedy was a silent film called "Courting Across the Court" and was released in theaters in 1911.
            </p>
            <p>
            Over the next decade, the slowly blossoming genre grew to have 37 titles in cinema.
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <Waypoint onEnter={this.draw2010Bar} bottomOffset="40%"><span className="waypoint"/></Waypoint>
            <p>
              However, between 2010 and 2017, 175 romantic comedies were shown in theaters.
            </p>
          </div>
        </div>
        <div className="card">
          <div className="card-content">
            <Waypoint onEnter={this.drawBars} bottomOffset="40%"><span className="waypoint"/></Waypoint>
            <p>
              Wikipedia has recorded 1568 romantic comedies between today and when "Courting Across the Court" was first released.
            </p>
            <p>
              In the 2000s, there was a significant surge of romantic comedies, where 1/5 of all romcoms came from one decade.
            </p>
          </div>
        </div>
        <div className="card">
        <div className="card-content">
          <p>
          </p>
        </div>
      </div>
      </section>
    )
  }
}

export default MovieBars
