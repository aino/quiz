var React = require('react')

React.initializeTouchEvents(true)

module.exports = React.createClass({

  propTypes: {
    click: React.PropTypes.func,
    up: React.PropTypes.func,
    down: React.PropTypes.func,
    nodeName: React.PropTypes.string,
    className: React.PropTypes.string
  },

  timer: null,
  clickTimer: null,

  getInitialState: function() {
    return {
      touched: false,
      touchdown: false,
      coords: { x:0, y:0 },
      evObj: {},
      canClick: false
    }
  },

  trigger: function(type, ev) {
    typeof this.props[type] == 'function' && this.props[type].call(this, ev)
  },

  getCoords: function(e) {
    if ( e.touches && e.touches.length ) {
      var touch = e.touches[0]
      return {
        x: touch.pageX,
        y: touch.pageY
      }
    }
  },

  componentDidMount: function() {
    console.log('mount')
    this.delayEventBus()
  },
  /*
  componentDidUpdate: function() {
    console.log('update')
    this.delayEventBus()
  },
  */
  delayEventBus: function() {
    this.clickTimer && clearTimeout(this.clickTimer)
    this.clickTimer = setTimeout(function() {
      this.setState({canClick: true})
      console.log('Can Click')
    }.bind(this), 400)
  },

  onTouchStart: function(e) {
    clearTimeout(this.timer)
    this.setState({
      touched: !( /^(select|input|textarea)$/i.test(e.target.nodeName) ), 
      touchdown: true,
      coords: this.getCoords(e),
      evObj: e
    })
    this.trigger('down', e)
  },

  onTouchMove: function(e) {
    var coords = this.getCoords(e)
    var distance = Math.max( 
      Math.abs(this.state.coords.x - coords.x), 
      Math.abs(this.state.coords.y - coords.y) 
    )
    if ( distance > 6 ) {
      this.state.touchdown && this.trigger('up', e)
      this.setState({ touchdown: false })
    }
  },

  onTouchEnd: function(e) {
    if(this.state.touchdown) {
      this.trigger('up', this.state.evObj)
      this.trigger('click', this.state.evObj)

      // optimize form controls too
      if ( !this.state.touched && !/^(radio|checkbox)$/i.test(e.target.type) )
        e.target.focus()

      // allow button submit
      if ( e.target.form && e.target.nodeName == 'BUTTON' && e.target.type == 'submit' )
        e.target.form.submit()
      
    }
    this.timer = setTimeout(function() {
      if ( this.isMounted() )
        this.setState(this.getInitialState())
    }.bind(this), 400)
  },

  onClick: function(e) {
    if ( this.state.touched || !this.state.canClick )
      return false
    this.trigger('click', e)
    this.setState(this.getInitialState())
  },

  on: function(type, fn) {
    var d = document
    if ( d.addEventListener )
      return d.addEventListener(type, fn, false)
    else if ( d.attachEvent )
      return d.attachEvent('on'+type, fn)
  },

  off: function(type, fn) {
    var d = document
    if ( d.removeEventListener )
      return d.removeEventListener(type, fn, false)
    else if ( d.detachEvent )
      return d.detachEvent('on'+type, fn)
  },

  onMouseDown: function(e) {
    if( this.state.touched || !this.state.canClick )
      return false
    this.trigger('down', e)
    var c = {}
    for( var i in e )
      c[i] = e[i]

    var onMouseUp = function(m) {
      c.type = 'mouseup'
      this.trigger('up', c)
      this.off('dragend', onMouseUp)
      this.off('mouseup', onMouseUp)
      this.off('contextmenu', onMouseUp)
    }.bind(this)

    this.on('dragend', onMouseUp)
    this.on('mouseup', onMouseUp)
    this.on('contextmenu', onMouseUp)

  },

  render: function() {
    return this.transferPropsTo(
      React.DOM[this.props.nodeName || 'div']({
        onTouchStart: this.onTouchStart,
        onTouchMove: this.onTouchMove,
        onTouchEnd: this.onTouchEnd,
        onClick: this.onClick,
        onMouseDown: this.onMouseDown
      }, this.props.children)
    )
  }
})