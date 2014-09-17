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
var globals = require('./globals')

// Temp data

Backbone.$ = $

React.initializeTouchEvents(true)

document.documentElement.className = detect.touch ? 'touch' : 'notouch'

// The global click handler
var clicked = false
var openLinkInTab = false
var crumbs = Backbone.history.crumbs = []
var history = Router.history

var clickHandler = function(e, handler) {

  var $target = $(e.target).closest('a, button')
  var href = $target.attr('href')

  if ( href && href !== '#' ) {
    $target.attr('data-href', href)
    $target.attr('href', '#')
  }

  var href = $target.attr('data-href')

  if ( href ) {
    clicked = true
    var fake = document.createElement('a')
    fake.href = href
    if (fake.host == "") // IE9
      fake.href = fake.href;
    if ( $target.attr('target') == '_blank' || openLinkInTab )
      window.open(href)
    else if ( fake.hostname !== window.location.hostname || fake.protocol !== window.location.protocol)
      window.location = href
    else {
      var h = Router.history
      if ( h && h.length && h[h.length-1].path == href )
        Backbone.history.loadUrl(href)
      else
        Router.navigate(href, true)
    }
    e.preventDefault()
  }
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

var goingBack = false

// expose a Run method instead of module for browser loader
window.Run = function() {

  var node = document.getElementById('app')

  // render the app
  var App = React.renderComponent(AppComponent({ 
    models: models,
    clickHandler: clickHandler,
    downHandler: function(e) {
      $(e.target).closest('a, button').addClass('down')
    },
    upHandler: function(e) {
      $(e.target).closest('a, button').removeClass('down')
    },
    setBodyClass: function(cl) {
      document.body.className = cl
    }
  }), node)

  $(document).on('keydown', function(e) {
    if (e.ctrlKey || e.which === 91)
      openLinkInTab = true
  }).on('keyup', function(e) {
    openLinkInTab = false
  })

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
    var proceed = function() {

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
    }

    var msg = globals.getUnloadMessage()
    if ( backbutton && msg && !goingBack ) {
      if ( window.confirm(msg) ) {
        proceed()
      }
      else {
        Backbone.history.history.go(1)
        crumbs.splice(-1,1)
        goingBack = true
      }
    } else {
      goingBack = false
      proceed()
    }
  })

  Backbone.history.start({pushState: true})

}
