/** @jsx React.DOM */

var React = require('react')
var models = require('../models')
var RequestFrame = require('ainojs-requestframe')
var TouchClick = require('ainojs-react-touchclick')

var GREEN = [60,144,119]
var RED = [202,82,90]
var CIRCLE = 40

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
    var solution = this.props.question.s
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
  onButtonDown: function(e) {
    e.currentTarget.className = 'selected'
  },
  onButtonUp: function(e) {
    e.currentTarget.className = ''
  },
  componentDidMount: function() {
    this.startTimer()
    this.tick()
  },
  componentWillUnmount: function() {
    this.stop = true
  },
  getColor: function() {
    var color = []
    GREEN.forEach(function(n,i) {
      color[i] = RED[i] - Math.round(( RED[i]-n )*this.state.score)
    }, this)
    return 'rgb('+color.join(',')+')'
  },
  componentDidUpdate: function(prevprops, prevstate) {
    if(prevprops.q !== this.props.q)
      this.startTimer()
    var degrees = 360 - (this.state.score*360)
    var ctx = this.refs.circle.getDOMNode().getContext('2d')
    var dim = CIRCLE*2
    ctx.strokeStyle = this.getColor()
    ctx.lineWidth = 3
    ctx.clearRect( 0, 0, dim, dim )
    ctx.beginPath()
    ctx.arc( dim/2, dim/2, dim/2-2, radius(-90), radius(degrees-90), false )
    ctx.stroke()
    ctx.closePath()
  },
  render: function() {
    var buttons = this.props.question.answers.map(function(a,i) {
      return <TouchClick data-index={i} click={this.onButtonClick} down={this.onButtonDown} up={this.onButtonUp} nodeName="button">{a}</TouchClick>
    }, this)

    var s = (this.state.limit * this.state.score)/1000
    s = s.toFixed( 1 )
    if ( s.length == 1 )
      s += '.0'

    var src = this.props.question.img
    var img
    if ( src )
      img = <div className="image"><img src={'/assets/quizimg/'+this.props.slug+'/'+src} /></div>

    return (
      <div className="question">
        {img}
        <h1>{this.props.question.title}</h1>
        <div className="buttons">
          {buttons}
        </div>
        <div className="circle">
          <canvas ref="circle" width={CIRCLE*2} height={CIRCLE*2} style={{width:CIRCLE,height:CIRCLE}} />
          <div className="counter" style={{color:this.getColor()}}>{s}</div>
        </div>
      </div>
    )
  }
})