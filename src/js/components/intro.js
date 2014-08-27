/** @jsx React.DOM */

var React = require('react')
var models = require('../models')

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <h1>{this.props.quiz.get('name')}</h1>
        <button onClick={this.props.start}>Start</button>
      </div>
    )
  }
})