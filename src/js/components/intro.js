/** @jsx React.DOM */

var React = require('react')
var TouchClick = require('ainojs-react-touchclick')
var Ajax = require('../ajax')
var Router = require('../router')
var models = require('../models')

module.exports = React.createClass({
  getInitialState: function() {
    return {
      loading: true
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
  },
  render: function() {

    var btn = this.state.loaded ? 
      <TouchClick nodeName="button" className="start" click={this.start}>Starta Quiz</TouchClick> :
      <div className="loading">Laddar Quiz...</div>

    return (
      <div>
        <h1>{this.props.quiz.get('title')}</h1>
        <p>{this.props.quiz.get('description')}</p>
        <div className="start">{btn}</div>
      </div>
    )
  }
})