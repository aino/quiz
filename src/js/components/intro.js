/** @jsx React.DOM */

var React = require('react')
var TouchClick = require('ainojs-react-touchclick')
var Ajax = require('../ajax')
var Router = require('../router')
var models = require('../models')
var Animation = require('ainojs-animation')
var $ = require('jquery')
var Easing = require('ainojs-easing')

var Slide = new Animation({
  duration: 600,
  easing: Easing('easeInOutQuart')
})

module.exports = React.createClass({
  getInitialState: function() {
    return {
      loading: true,
      top: 0,
      firstLoad: false,
      opacity: 0
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
    Slide.on('complete', this.onSlideComplete)
    Slide.animateTo({
      top: -this.getHeight(),
      opacity: 0
    })
  },
  onAjax: function(response) {
    models.user.set('uid', response.uid)
    Router.navigate('/'+this.props.slug+'/'+response.uid, true)
  },
  componentDidMount: function() {
    models.user.set(models.user.defaults)

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

    setTimeout(function() {
      if ( this.isMounted() ) {
        console.log(this.getHeight())
        this.setState({
          firstLoad: true,
          top: -this.getHeight()
        }, function() {
          Slide.init({
            top: this.state.top,
            opacity: 0
          }).animateTo({
            top: 0,
            opacity: 1
          })
        })
      }
    }.bind(this), 400)

    Slide.on('frame', this.onSlideFrame)
  },
  onSlideFrame: function(e) {
    this.setState(e.values)
  },
  onSlideComplete: function() {
    Ajax.get('/api/uid', []).success(this.onAjax)
  },
  getHeight: function() {
    return $(this.refs.intro.getDOMNode()).outerHeight()
  },
  render: function() {

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
      var q = this.props.quiz.questions
      for( var i=0; i < q.length; i++) {
        if ( q.img ) {
          src = q.img
          break
        }
      }
    }

    var img = src ? <img src={'/assets/quizimg/'+this.props.slug+'/'+src} /> : null

    return (
      <div style={style} className="intro" ref="intro">
        <div className="image">
          {img}
        </div>
        <h1>{this.props.quiz.get('title')}</h1>
        <p>{this.props.quiz.get('description')}</p>
        <div className="start">{btn}</div>
      </div>
    )
  }
})

