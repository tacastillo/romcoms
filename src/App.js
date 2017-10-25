import './styles/App.scss'

import React, {Component} from 'react'
import * as d3 from 'd3'

import * as constants from "./constants"

import TitleCard from './components/TitleCard.js'
import MovieBars from './components/MovieBars.js'

class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section>
        <TitleCard></TitleCard>
        <div className="svg-wrapper">
          <svg id="base" viewBox="0 0 1200 900" preserveAspectRatio="xMinYMin" className="base-svg"></svg>
        </div>
        <div className="content-wrapper">
          <MovieBars></MovieBars>
          <div className="fade"></div>
        </div>
      </section>
    );
  }
}

export default App
