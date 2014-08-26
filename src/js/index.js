/** @jsx React.DOM */

var React = require('react')
var $ = require('jquery')
var Backbone = require('backbone')
var Router = require('./router')
var Routes = require('./routes')
var AppComponent = require('./components/app')
var models = require('./models')
var detect = require('ainojs-detect')
var Qs = require('qs')

// Temp data
var QuizData = require('./quiz.json')
models.quizes.add(QuizData)

Backbone.$ = $

React.initializeTouchEvents(true)

document.documentElement.className = detect.touch ? 'touch' : 'notouch'

// The global click handler
var clicked = false
var openLinkInTab = false
var crumbs = Backbone.history.crumbs = []
var history = Router.history

var clickHandler = function(e) {

  var $target = $(e.target).closest('a, button')
  var href = $target.attr('href')

  if ( href && href !== '#' ) {
    $target.attr('data-href', href)
    $target.attr('href', '#')
  }

  href = $target.attr('data-href')
  clicked = true

  if ( href ) {
    var fake = document.createElement('a')
    fake.href = href
    if ( $target.attr('target') == '_blank' )
      window.open(href)
    else if ( fake.hostname !== window.location.hostname || fake.protocol !== window.location.protocol)
      window.location = href
    else if ( !openLinkInTab ) {
      var h = Router.history
      if ( h && h.length && h[h.length-1].path == href )
        Backbone.history.loadUrl(href)
      else
        Router.navigate(href, true)
    }
  }
  
  e.preventDefault()
}

// pass methods and properties to the route
var routeApi = {
  isModal: false,
  setTitle: function(title) {
    document.title = title + ' – Kokplatta'
  }
}

// method for scrolling back between views
var scrollBack = function() {
  window.scrollTo(0,0)
}

// expose a Run method instead of module for browser loader
window.Run = function() {

  var node = document.getElementById('app')

  // render the app
  var App = React.renderComponent(AppComponent({ 
    models: models,
    clickHandler: clickHandler,
    onKeyDown: function(e) {
      if (e.ctrlKey || e.keyCode === 91)
        openLinkInTab = true
    },
    onKeyUp: function(e) {
      openLinkInTab = false
    }
  }), node)

  // start router
  Router.on('route', function(name, paths) {

    var query = paths.pop()
    query = query && window.location.search ? Qs.parse(query) : {}

    var params = {
      paths: paths,
      query: query
    }

    var route = $.extend({}, routeApi)

    // call the route
    if ( Routes.hasOwnProperty(name) )
      Routes[name].call(route, params)

    // detect backbutton and save crumbs
    var fragment = Backbone.history.getFragment()
    var backbutton = Backbone.history.backbutton = !clicked && crumbs.length > 1 && fragment == crumbs[crumbs.length-2]

    if(!history.length || detect.touch)
      route.isModal = false

    history.push({
      name: name,
      params: params,
      path: window.location.pathname,
      modal: route.isModal
    })

    var wasModal = ( history.length > 2 && history[history.length-2].modal )

    if ( route.isModal ) {
      App.setState({ modal: true, wasmodal: false })
    } else {
      if (!wasModal)
        scrollBack()
      node.className = name
      App.setState({
        modal: route.isModal,
        wasmodal: wasModal,
        route: {
          name: name,
          params: params
        }
      })
    }

    clicked = false
    if ( backbutton )
      crumbs.splice(-2,2)
    crumbs.push(fragment)

  })

  Backbone.history.start({pushState: true})

}
