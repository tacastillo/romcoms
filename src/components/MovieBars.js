import '../../styles/TitleCard.scss'

import React, {Component} from 'react'
import Waypoint from 'react-waypoint'
import * as d3 from 'd3'
import { interpolate } from 'flubber'

import * as constants from "../../constants.js"

class MovieBars extends Component {

  componentDidMount() {
    this.titlePath = "M0,0 L1200,0 L1200,900 L0,900Z";

    this.svg = d3.select("#base")
      .classed("title-box", true);

    this.path = this.svg.append("path")
        .classed("title", true)
        .attr("fill", constants.colors.BLUE)
        .attr('d', this.titlePath);
  }

  titleToBox = () => {
    let shrunkBox = "M400, 400 L500,400 L500,500 L400,500Z";

    let interpolator = interpolate(this.titlePath, shrunkBox);

    d3.select("#base")
      .classed("title-box", false)
      .attr('viewBox', "0 0 900 900");

    d3.select(".title")
        .classed('title', false)
        .transition()
          .duration(750)
          .attrTween("d", function(){ return interpolator; });
  }

  render() {
    return (
      <div className="title card">
        <Waypoint onEnter={this.titleToBox} bottomOffset="200px"/>
        Here is some text
      </div>
    )
  }
}

export default MovieBars
