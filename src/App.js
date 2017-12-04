import './styles/App.scss'

import React, {Component} from 'react'
import * as d3 from 'd3'

import * as constants from "./constants"

import TitleCard from './components/TitleCard.js'
import MovieBars from './components/MovieBars.js'
import ActorBars from './components/ActorBars.js'
import RatioLine from './components/RatioLine.js'
import Scatter from './components/Scatter.js'

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      step: constants.steps.BOX
    }
  }

  incrementStep = () => {
    this.setState((state) => ({step : state.step + 1}));
  }

  render() {
    return (
      <section>
        <TitleCard/>
        <div className="svg-wrapper">
          <svg id="base" viewBox="0 0 1200 1200" preserveAspectRatio="xMidYMid" className="base-svg"></svg>
        </div>
        <div className="content-wrapper">
          <MovieBars step={this.state.step} incrementStep={this.incrementStep}/>
          <ActorBars step={this.state.step} incrementStep={this.incrementStep}/>
          <RatioLine step={this.state.step} incrementStep={this.incrementStep}/>
          <Scatter step={this.state.step} incrementStep={this.incrementStep}/>
          <div style={{height: '100vh'}}>
          </div>
          <div className="fade"></div>
        </div>
      </section>
    );
  }
}

export default App
