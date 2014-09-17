/** @jsx React.DOM */

var React = require('react')
var models = require('../models')
var TouchClick = require('ainojs-react-touchclick')
var IntroComponent = require('./intro')
var OutroComponent = require('./outro')
var QuestionComponent = require('./question')
var Ajax = require('../ajax')
var Router = require('../router')
var Results = require('../results')
var models = require('../models')
var globals = require('../globals')

module.exports = React.createClass({

  getInitialState: function() {
    return {
      modal: false,
      route: { name: null, params: [] },
      wasmodal: false
    }
  },

  componentDidMount: function() {
    // listen for backbone changes and force update
    // this makes the entire app reactive
    for( var inst in models )
      models[inst].on('add change remove reset', function() {
        this.forceUpdate()
      }, this)

  },

  componentWillUnmount: function() {
    // forget the backbone binding
    for( var inst in this.props.models )
      models[inst].off(null, null, this)
    PubSub.off(this.backToken)
  },

  onAnswer: function(answer) {
    models.user.set({ 
        answers : models.user.get('answers').concat(answer)
    })
    models.user.trigger('change')
  },

  render: function() {

    var routeName = this.state.route.name

    // if there is no route name, we can assume that the route hasn't called it's first callback yet
    if ( !routeName )
      return <div />

    if ( routeName == '404' )
      return <div>404</div>

    var slug = this.state.route.params.paths[0]
    var slugid = this.state.route.params.paths[1]
    var quiz = models.quizes.getModel({ slug: slug })
    
    var uid = models.user.get('uid')

    var questions = quiz.get('questions')
    var answers = models.user.get('answers')
    var n = answers.length

    if ( !questions )
      return <div className="loading" />

    var main

    if ( !uid || uid !== slugid ) {
      globals.clearUnload()
      this.props.setBodyClass('')
      main = <IntroComponent start={this.onStart} quiz={quiz} slug={slug} />
    }
    else if ( n < quiz.get('questions').length ) {
      main = <QuestionComponent slug={slug} q={n} question={quiz.getQuestion(n)} onAnswer={this.onAnswer} />
      globals.setUnloadMessage(function() { return 'Är du säker på att du vill avbryta ditt quiz?' })
      this.props.setBodyClass('rolling')
    } else {
      main = <h1>Score: <strong>{Results(answers)}</strong></h1>
      globals.clearUnload()
      Ajax.post('/api/results', {uid: uid, answers: answers}).success(function(response) {
        console.log('saved')
      }.bind(this))
      this.props.setBodyClass('')
    }

    return (
      <TouchClick down={this.props.downHandler} up={this.props.upHandler}>
        {main}
      </TouchClick>
    )
  }
})
