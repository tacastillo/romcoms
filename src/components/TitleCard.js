import React, {Component} from 'react'
import Waypoint from 'react-waypoint'
import * as d3 from 'd3'
import { interpolate } from 'flubber'

import * as constants from "../constants.js"

class TitleCard extends Component {

  componentDidMount() {
	setTimeout(() => {
		d3.select(".title")
			.classed("step-two", true);
	}, 1500);
  }

  render() {
    return (
	  <div className="title">
		<h1>America's Obsession with</h1>
		<h1>Romantic Comedies</h1>
		<div className="title-description">
		<h3>
			Growing up as a child of the late 90s and 00s, it seemed like every movie
			that came out in theaters was a some sappy love story.
			<br/><br/>
			Romantic Comedies, commonly referred to by their nickname "romcoms"
			have become a staple genre in the movie industry.
			<br/><br/>
			But how far do romcoms go back in history?
			Does Hollywood keep making them because they're profitable?
			Are Meg Ryan and Jake Gyllenhaal in all of them?
		</h3>
		</div>
	  </div>
    )
  }
}

export default TitleCard
