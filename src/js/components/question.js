/** @jsx React.DOM */

var React = require('react')
var models = require('../models')
var RequestFrame = require('ainojs-requestframe')
var TouchClick = require('ainojs-react-touchclick')

var GREEN = [60,144,119]
var RED = [202,82,90]

var radius = function( degrees ) {
  return degrees * ( Math.PI/180 );
}

module.exports = React.createClass({
  getInitialState: function() {
    return {
      timestamp: null,
      limit: 0,
      score: null
    }
  },
  stop: false,
  tick: function() {
    if ( !this.isMounted() )
      return
    if ( !this.stop && this.state.timestamp !== null ) {
      var score = 1-Math.min(1, (Date.now() - this.state.timestamp)/this.state.limit)
      this.setState({ score: score })
      if ( score === 0 ) {
        this.setState({ timestamp: null }, function() {
          this.answer()
        })
      }
    }
    this.stop || RequestFrame(this.tick)
  },
  startTimer: function() {
    this.setState({
      timestamp: Date.now(),
      limit: this.props.question.time*1000,
      score: 1
    })
  },
  answer: function(guess) {
    var solution = this.props.question.solution
    this.props.onAnswer({
      timescore: this.state.score,
      score: Number(guess === solution),
      record: {
        question: this.props.q,
        solution: solution,
        guess: guess,
        seconds: Math.floor((this.state.limit*this.state.score)/100)/10
      }
    })
  },
  onButtonClick: function(e) {
    this.answer(parseInt(e.target.getAttribute('data-index'), 10))
  },
  componentDidMount: function() {
    this.startTimer()
    this.tick()
  },
  componentWillUnmount: function() {
    this.stop = true
  },
  componentDidUpdate: function(prevprops, prevstate) {
    if(prevprops.q !== this.props.q)
      this.startTimer()
    var degrees = this.state.score*360
    var ctx = this.refs.circle.getDOMNode().getContext('2d')
    var dim = 60
    ctx.strokeStyle = 'rgba(0,0,0,.2)';
    ctx.lineWidth = 3;
    ctx.clearRect( 0, 0, dim, dim );
    ctx.beginPath();
    ctx.arc( dim/2, dim/2, dim/2-2, radius(-90), radius(degrees-90), false );
    ctx.stroke();
    ctx.closePath();
  },
  render: function() {
    var buttons = this.props.question.answers.map(function(a,i) {
      return <TouchClick data-index={i} click={this.onButtonClick} nodeName="button">{a}</TouchClick>
    }, this)

    var color = []
    GREEN.forEach(function(n,i) {
      color[i] = RED[i] - Math.round(( RED[i]-n )*this.state.score)
    }, this)

    var progressStyles = {
      width: 100*this.state.score + '%',
      backgroundColor: 'rgb('+color.join(',')+')',
    }

    return (
      <div className="question">
        <h1>{this.props.question.title}</h1>
        <div className="buttons">
          {buttons}
        </div>
        <div className="bar">
          <div className="progress" style={progressStyles} />
        </div>
        <div className="circle">
          <canvas ref="circle" width="60" height="60"/>
        </div>
      </div>
    )
  }
})