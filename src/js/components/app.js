/** @jsx React.DOM */

var React = require('react')
var models = require('../models')
var TouchClick = require('ainojs-react-touchclick')
var IntroComponent = require('./intro')
var QuestionComponent = require('./question')


module.exports = React.createClass({

  getInitialState: function() {
    return {
      modal: false,
      route: { name: null, params: [] },
      wasmodal: false,
      q: null,
      answers: []
    }
  },

  componentDidMount: function() {

    // listen for backbone changes and force update
    // this makes the entire app reactive
    for( var inst in this.props.models )
      this.props.models[inst].on('add change remove reset', function() {
        this.forceUpdate()
      }, this)

  },

  componentWillUnmount: function() {

    // forget the backbone binding
    for( var inst in this.props.models )
      this.props.models[inst].off(null, null, this)
  },

  onStart: function(e) {
    if ( this.state.q === null )
      this.setState({ q: 0 })
  },

  onAnswer: function(e) {
    var a = this.state.answers.slice(0)
    a.push( e.target.getAttribute('data-index') )
    console.log(a)
    this.setState({ 
      answers: a,
      q: this.state.q+1
    })
  },

  render: function() {

    var routeName = this.state.route.name

    // if there is no route name, we can assume that the route hasn't called it's first callback yet
    if ( !routeName )
      return <div />

    if ( routeName == '404' )
      return <div>404</div>

    var main = this.state.q === null ? 
      <IntroComponent start={this.onStart} /> : 
      <QuestionComponent q={this.state.q} answer={this.onAnswer} />

    return (
      <TouchClick click={this.props.clickHandler}>
        {main}
      </TouchClick>
    )
  }
})
