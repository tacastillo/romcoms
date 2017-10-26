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

    let maxNumBoxes = d3.max(this.boxData, (d) => +d.numBoxes+1);

    this.xScale = d3.scaleBand()
      .domain(Object.keys(data))
      .rangeRound([20, 1180])

    this.xCenter = this.xScale(1960);

    let yRange = d3.range(maxNumBoxes).map((i) => {
      console.log(this.bottom - +i * 110);
      return this.bottom - +i * 110;
    })
    console.log(yRange);

    this.yScale = d3.scaleOrdinal()
      .domain(d3.range(maxNumBoxes))
      .range(yRange);

    this.svg = d3.select("#base")
      .classed("title-box", true);

    this.appendBox({
      d: this.updatePath(this.boxPath, this.xCenter, this.yScale(0)),
      fill: constants.colors.BLUE
    })

    let animations = [
        {function: this.drawFirstLabels, delay: 0},
        {function: this.draw2010Bar, delay: 1000},
        {function: this.drawBars, delay: 1500}
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
    let i = 1;

    for (i in d3.range(numBoxes)) {
      console.log(+i, this.yScale(+i))
      this.appendBox({
        fill: constants.colors.BLUE,
        opacity: 0,
        d: this.updatePath(this.boxPath, this.xCenter, this.yScale(+i)),
      });
    }

    i++;

    this.appendBox({
      fill: constants.colors.BLUE,
      opacity: 0,
      d: this.updatePath(this.boxPath, this.xCenter, this.yScale(+i) + (1-remainder) * 100, remainder)
    });



    this.labels.select('#box-decade')
      .transition().duration(1000)
      .tween("text", () => tweenNumberLabels(decade, '#box-decade'))

    this.labels.select("#box-quantity")
      .transition().duration(900)
      .ease(d3.easeLinear)
      .attr('transform', `translate(0, -${ ( +i + (1 - remainder))*98})`)
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

    let that = this;
    let boxes = d3.selectAll(".box");

    let xEnd = this.xScale(2010) - this.xCenter;
    let textTransform = `${this.labels.attr('transform') || ""} translate(${xEnd},0)`;

    this.labels.transition().duration(1000)
      .attr('transform', textTransform);

    d3.selectAll(".box").transition().duration(1000)
      .attr('d', function(box) {
        let d = d3.select(this).attr('d');
        return that.updatePath(d, xEnd, 0);
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
              d: this.updatePath(this.boxPath, x, this.bottom - i*110)
            });
        }

        if (i > 0) {
          i++;
        }

        if (bar.remainder > 0) {
          let box = this.appendBox({
            fill: constants.colors.BLUE,
            opacity: 0,
            d: this.updatePath(this.boxPath, x, this.yScale(+i) + (1-bar.remainder) * 100, bar.remainder),
          });
        }
      }

      let xRange = this.xScale.domain().map((d) => this.xScale(d));
      d3.selectAll('.box').transition()
        .delay(function(d,i) {
          let path = d3.select(this).attr('d');
          let xPath = +path.split(",")[0].slice(1);
          let xBotPath = +that.boxPath.split(",")[0].slice(1);
          let xDelta = xPath - xBotPath
          return 2000 - ((xRange.indexOf(xDelta)) * 200);
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
    return this.svg.append("path")
      .classed("box", true)
      .attrs(attrs);
  }

  updatePath = (path, xTrans, yTrans, yScale) => {
    yScale = yScale ? yScale : 1;
    let newPath = path.split(" ").map((coord) => {
      let presplit = coord.split(",");
      let split = {
        pre: coord[0],
        x: +presplit[0].slice(1) + xTrans,
        y: +(presplit[1].split("Z")[0] * yScale) + yTrans,
        post: coord.indexOf("Z") >=0
      };
      return split.pre + split.x + "," + split.y + (split.post ? "Z" : "");
    });
    return newPath.join(" ");
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
