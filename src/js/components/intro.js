/** @jsx React.DOM */

var React = require('react')
var TouchClick = require('ainojs-react-touchclick')
var Ajax = require('../ajax')
var Router = require('../router')
var models = require('../models')

module.exports = React.createClass({
  start: function() {
    Ajax.get('/api/uid', []).success(this.onAjax)
  },
  onAjax: function(response) {
    models.user.set('uid', response.uid)
    Router.navigate('/'+this.props.slug+'/'+response.uid, true)
  },
  componentDidMount: function() {
    models.user.set(models.user.defaults)
    this.start()
  },
  render: function() {
    return <div />
    return (
      <div>
        <h1>{this.props.quiz.get('title')}</h1>
        <p>{this.props.quiz.get('description')}</p>
        <div className="start">
          <TouchClick nodeName="button" className="start" click={this.start}>Starta Quiz</TouchClick>
        </div>
      </div>
    )
  }
})