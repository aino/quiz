/** @jsx React.DOM */

var React = require('react')
var models = require('../models')
var RequestFrame = require('ainojs-requestframe')
var TouchClick = require('ainojs-react-touchclick')

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
  componentDidUpdate: function(prevprops) {
    if(prevprops.q !== this.props.q)
      this.startTimer()
  },
  render: function() {
    var buttons = this.props.question.answers.map(function(a,i) {
      return <TouchClick data-index={i} click={this.onButtonClick} nodeName="button">{a}</TouchClick>
    }, this)

    var progressStyles = {
      width: 100*this.state.score + '%',
      height: 10,
      backgroundColor: '#000',
      'float': 'right'
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