/** @jsx React.DOM */

var React = require('react')
var models = require('../models')

module.exports = React.createClass({
  render: function() {
    var m = models.quizes.getModel({ slug: 'test' })
    return (
      <div>
        <h1>{m.get('name')}</h1>
        <button onClick={this.props.start}>Start</button>
      </div>
    )
  }
})