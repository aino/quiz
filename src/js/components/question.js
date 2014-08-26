/** @jsx React.DOM */

var React = require('react')
var models = require('../models')

var m = models.quizes.getModel({ slug: 'test' })

module.exports = React.createClass({
  render: function() {
    var m = models.quizes.getModel({ slug: 'test' })
    var q = m.get('questions')[this.props.q]
    var a = q.answers.map(function(a,i) {
      return <button data-index={i} onClick={this.props.answer}>{a}</button>
    }, this)
    return (
      <div>
        <h1>{q.title}</h1>
        {a}
      </div>
    )
  }
})