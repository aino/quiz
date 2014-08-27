/** @jsx React.DOM */

var React = require('react')
var models = require('../models')
var RequestFrame = require('ainojs-requestframe')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      time: null,
      limit: 0,
      elapsed: 0
    }
  },
  stop: false,
  tick: function() {
    if ( !this.stop && this.state.time !== null ) {
      var elapsed = Date.now() - this.state.time
      this.setState({ elapsed: elapsed })
      if ( elapsed >= this.state.limit ) {
        this.setState({ time: null, elapsed: 0 }, function() {
          this.props.onAnswer({
            time: this.state.limit,
            guess: null
          })
        })
      }
    }
    this.stop || RequestFrame(this.tick)
  },
  startTimer: function() {
    this.setState({
      time: Date.now(),
      limit: this.props.question.time*1000,
      elapsed: 0
    })
  },
  onAnswer: function(e) {
    this.props.onAnswer({
      time: this.state.elapsed,
      guess: parseInt(e.target.getAttribute('data-index'), 10)
    })
  },
  componentDidMount: function() {
    this.startTimer()
    this.tick()
  },
  componentWillUnmount: function() {
    this.stop = true
  },
  componentDidUpdate: function(prevprops) {
    if(prevprops.q !== this.props.q)
      this.startTimer()
  },
  render: function() {
    var buttons = this.props.question.answers.map(function(a,i) {
      return <button data-index={i} onClick={this.onAnswer}>{a}</button>
    }, this)

    var progressStyles = {
      width: (100*(this.state.elapsed/this.state.limit)) + '%',
      height: 10,
      backgroundColor: '#000'
    }

    return (
      <div>
        <h1>{this.props.question.title}</h1>
        {buttons}
        <div className="bar" style={{height:10, backgroundColor:'#eee'}}>
          <div className="progress" style={progressStyles} />
        </div>
      </div>
    )
  }
})