/** @jsx React.DOM */

var React = require('react')
var TouchClick = require('ainojs-react-touchclick')
var Ajax = require('../ajax')
var Router = require('../router')
var models = require('../models')
var Animation = require('ainojs-animation')
var $ = require('jquery')
var Easing = require('ainojs-easing')
var RequestFrame = require('ainojs-requestframe')

var TIME = 3

module.exports = React.createClass({

  slider: null,
  counter: null,
  uid: null,

  getInitialState: function() {
    return {
      loading: true,
      top: 0,
      firstLoad: false,
      opacity: 0,
      countdown: null,
      countfinish: false,
      countTop: -30,
      countOpacity: 0 
    }
  },
  loadImage: function(src, cb) {
    var i = new Image()
    i.onload = function() {
      cb.call(this, i.src)
    }.bind(this)
    i.src = '/assets/quizimg/'+this.props.slug+'/'+src
  },
  start: function() {
    Ajax.get('/api/uid', []).success(this.onAjax)
  },
  tick: function() {
    if ( !this.isMounted() )
      return
    var now  = +new Date()
    var diff = now-timer
    var secs = TIME-Math.floor(diff/1000)

    if ( diff > 50 && !this.state.countload )
      this.setState({ countload: true })

    if ( secs !== this.state.countdown )
      this.setState({ countdown: secs })
    
    if ( diff < (TIME*1000) )
      RequestFrame(this.tick)
    else
      this.onCountdownFinish()
  },
  onAjax: function(response) {
    this.uid = response.uid
    models.user.set('uid', this.uid)
    this.slider.setOptions({
      easing: Easing('easeInCubic'),
      duration: 400
    })
    setTimeout(this.onSliderComplete, 250)
    this.slider.animateTo({
      top: -this.getHeight(),
      opacity: 0
    })
  },
  onCountdownFinish: function() {
    /*
    Counter.on('complete', this.onCounterComplete)
    Counter.config.easing = Easing('easeInCubic')
    Counter.animateTo({
      countTop: -20,
      countOpacity: 0
    })
    */
    this.onCounterComplete()
  },
  componentDidMount: function() {

    models.user.set(models.user.defaults)
    //
    /*
    Ajax.get('/api/uid', []).success(function(response) {
      models.user.set('uid', response.uid)
      Router.navigate('/'+this.props.slug+'/'+response.uid, true)
    }.bind(this))
    return
    */
    //
    var q = this.props.quiz.get('questions')
    var im = q.filter(function(a) {
      return a.img
    })
    var loaded = 0
    im.forEach(function(a, i) {
      this.loadImage(a.img, function() {
        if(++loaded == im.length)
          this.setState({ loaded: true })
      })
    }, this)

    if ( this.slider )
      this.slider.destroy()

    if ( this.counter )
      this.counter.destroy()

    this.slider = new Animation({
      duration: 600,
      easing: Easing('easeOutQuart')
    })

    this.counter = new Animation({
      duration: 400,
      easing: Easing('easeOutQuart')
    })

    this.uid = null

    setTimeout(function() {
      if ( this.isMounted() ) {
        this.setState({
          firstLoad: true,
          top: -this.getHeight()
        }, function() {
          this.slider.init({
            top: this.state.top,
            opacity: 0
          }).animateTo({
            top: 0,
            opacity: 1
          })
        })
      }
    }.bind(this), 400)

    this.slider.on('frame', this.onSliderFrame)
    this.counter.on('frame', this.onCounterFrame)

  },
  componentWillUnmount: function() {
    this.slider && this.slider.destroy()
    this.counter && this.counter.destroy()
    this.uid = null
  },
  onSliderFrame: function(e) {
    this.setState(e.values)
  },
  onCounterFrame: function(e) {
    this.setState(e.values)
  },
  onCounterComplete: function() {
    Router.navigate('/'+this.props.slug+'/'+this.uid, true)
  },
  onSliderComplete: function() {
    timer = +new Date()
    this.tick()
    this.counter.init({ 
      countTop: this.state.countTop,
      countOpacity: this.state.countOpacity
    }).animateTo({
      countTop: 0,
      countOpacity: 1
    })
  },
  getHeight: function() {
    return $(this.refs.intro.getDOMNode()).outerHeight()
  },
  render: function() {

    var intro
    var counter

    var btn = this.state.loaded ? 
      <TouchClick nodeName="button" className="start" down={this.start}>Starta Quiz</TouchClick> :
      <div className="loading">Laddar Quiz...</div>

    var style = {
      '-webkit-transform': 'translate3d(0,'+this.state.top+'px,0)',
      visibility: this.state.firstLoad ? 'visible' : 'hidden',
      opacity: this.state.opacity
    }

    var src = this.props.quiz.get('img')
    if ( !src ) {
      var q = this.props.quiz.get('questions')
      for( var i=0; i < q.length; i++) {
        if ( q.img ) {
          src = q.img
          break
        }
      }
    }

    var img = src ? <img src={'/assets/quizimg/'+this.props.slug+'/'+src} /> : null

    intro = (
      <div style={style} className="intro" ref="intro">
        <div className="image">
          {img}
        </div>
        <h1>{this.props.quiz.get('title')}</h1>
        <p>{this.props.quiz.get('description')}</p>
        <div className="start">{btn}</div>
      </div>
    )

    var countStyles = {
      '-webkit-transform': 'translate3d(0,'+this.state.countTop+'px,0)',
      opacity: this.state.countOpacity,
      display: this.state.countdown === null ? 'none' : 'block'
    }
    counter = (
      <div className='countdown' style={countStyles}>
        <span>Quizet startar om</span>
        <strong className="no">{this.state.countdown}</strong>
        <span className="tip"><strong>Tips:</strong> Ju snabbare du svarar på frågorna desto mer poäng får du.</span>
      </div>
    )

    return (
      <div className="starter">
        {counter}
        {intro}
      </div>
    )
  }
})

