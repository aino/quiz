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

  onAnswer: function(answer) {
    var a = this.state.answers.slice(0)
    a.push( answer )
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

    var test = models.quizes.getModel({ slug: 'test' })

    var main

    if ( this.state.q === null )
      main = <IntroComponent start={this.onStart} quiz={test} />
    else if (this.state.q < test.get('questions').length )
      main = <QuestionComponent q={this.state.q} question={test.get('questions')[this.state.q]} onAnswer={this.onAnswer} />
    else
      main = <div>WIN</div>

    return (
      <TouchClick click={this.props.clickHandler}>
        {main}
      </TouchClick>
    )
  }
})
