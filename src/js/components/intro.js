/** @jsx React.DOM */

var React = require('react')
var TouchClick = require('ainojs-react-touchclick')

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <h1>{this.props.quiz.get('name')}</h1>
        <p>{this.props.quiz.get('description')}</p>
        <div className="start">
          <TouchClick nodeName="button" click={this.props.start}>Start</TouchClick>
        </div>
      </div>
    )
  }
})