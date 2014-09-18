/** @jsx React.DOM */

var React = require('react')
var models = require('../models')
var RequestFrame = require('ainojs-requestframe')
var TouchClick = require('ainojs-react-touchclick')
var Easing = require('ainojs-easing')
var Animation = require('ainojs-animation')
var $ = require('jquery')

var GREEN = [60,144,119]
var RED = [245,10,10]
var CIRCLE = 40
var DISTANCE = 20

var radius = function( degrees ) {
  return degrees * ( Math.PI/180 )
}

module.exports = React.createClass({
  slider: null,
  getInitialState: function() {
    return {
      timestamp: null,
      limit: 0,
      score: null,
      top: -DISTANCE,
      opacity: 0,
      answer: null
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
    this.stop = false
    this.tick()
  },
  answer: function(guess) {
    var solution = this.props.question.s
    this.setState({ answer: {
      timescore: this.state.score,
      score: Number(guess === solution),
      record: {
        question: this.props.q,
        solution: solution,
        guess: guess,
        seconds: Math.floor((this.state.limit*this.state.score)/100)/10
      }
    }})
    this.stop = true
    this.slider.animateTo({
      top: -DISTANCE,
      opacity: 0
    })
  },
  onSliderComplete: function() {
    if (this.state.answer) {
      this.slider.setOptions({ easing: Easing('easeOutQuad') })
      var a = $.extend(true, {}, this.state.answer)
      if( this.isMounted() )
        this.setState({ 
          answer: null,
          score: 1
        })
      this.props.onAnswer(a)

    } else if ( this.state.top > -1 ) {
      this.slider.setOptions({ easing: Easing('easeOutQuad') })
      this.startTimer()
    }
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
    this.tick()
    if ( this.slider )
      this.slider.destroy()
    this.slider = new Animation({
      duration: 200,
      easing: Easing('easeOutQuad')
    })
    this.slider.on('frame', this.onAnimFrame)
    this.slider.on('complete', this.onSliderComplete)
    this.slider.init({ 
      top: this.state.top, 
      opacity: this.state.opacity 
    })
    setTimeout(function() {
      if ( this.isMounted() ) {
        this.slider.animateTo({
          top: 0,
          opacity: 1
        })
      }
    }.bind(this), 20)
  },
  onAnimFrame: function(e) {
    this.setState(e.values)
  },
  componentWillUnmount: function() {
    this.stop = true
    this.slider.destroy()
  },
  getColor: function() {
    var color = []
    GREEN.forEach(function(n,i) {
      color[i] = RED[i] - Math.round(( RED[i]-n )*this.state.score)
    }, this)
    return 'rgb('+color.join(',')+')'
  },
  componentDidUpdate: function(prevprops, prevstate) {
    if(prevprops.q !== this.props.q) {
      this.slider.moveTo({
        top: -DISTANCE,
        opacity: 0
      })
      setTimeout(function() {
        this.slider.animateTo({
          top: 0,
          opacity: 1
        })
      }.bind(this), 4)
    }
    /*
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
    */
  },
  render: function() {
    var buttons = this.props.question.answers.map(function(answer) {
      return <TouchClick data-index={answer.i} click={this.onButtonClick} down={this.onButtonDown} up={this.onButtonUp} nodeName="button">{answer.a}</TouchClick>
    }, this)

    var s = (this.state.limit * this.state.score)/1000
    s = s.toFixed( 1 )
    if ( s.length == 1 )
      s += '.0'
    var perc = (this.state.score*100)+'%'

    var src = this.props.question.img
    var img
    if ( src )
      img = <img src={'/assets/quizimg/'+this.props.slug+'/'+src} />

    style = {
      '-webkit-transform': 'translate3d(0,'+this.state.top+'px,0)',
      opacity: this.state.opacity
    }

    var bar = (
      <div className="bar">
        <div>
          <div className="progress" style={{backgroundColor: this.getColor(), width: perc}}/>
          <div className="anim" />
        </div>
      </div>
    )

    return (
      <div className="question" style={style}>
        <div className="image">{img}</div>
        <div className="title">
          <h1>lorem ism wef  ff fffffef wef {this.props.question.title}</h1>
        </div>
        <div className="buttons">
          {buttons}
        </div>
        {bar}
        {/*
        <div className="circle">
          <canvas ref="circle" width={CIRCLE*2} height={CIRCLE*2} style={{width:CIRCLE,height:CIRCLE}} />
          <div className="counter" style={{color:this.getColor()}}>{s}</div>
        </div>
        */}
      </div>
    )
  }
})