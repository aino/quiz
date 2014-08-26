var Backbone = require('backbone')
var $ = require('jquery')

var trigger = function(result, success) {
  this.empty = !result.result.length
  this.reset(result.result)
  this.loading = false
  this.trigger('change')
  typeof success == 'function' && success(this, result.result)
}

var BaseCollection = Backbone.Collection.extend({

  dataUrl: null,

  cache: {},

  load: function(query, success, error) {

    this.loading = true
    this.empty = false
    this.reset()

    var q = query ? JSON.stringify(query) : ''

    setTimeout(function() {

      if ( this.cache.hasOwnProperty(q) ) {
        var result = this.cache[q]
        trigger.call(this, result, success)
        return
      }

      $.ajax({
        url: this.dataUrl,
        data: query,
        success: function(result) {
          trigger.call(this, result, success)
          this.cache[q] = result
        }.bind(this),
        dataType: 'json'
      })
    }.bind(this), 4)
  },

  isLoading: function() {
    return !!this.loading
  },

  isEmpty: function() {
    return !!this.empty
  },

  comparator: function(model) {
    var position = model.get('position')
    return typeof position != 'undefined' ? position : model.get('name')
  },

  getModel: function(needle) {
    var model = this.findWhere(needle)
    if ( model )
      return model
    return new this.model() // return empty model so react can still render
  }
})

var Quiz = Backbone.Model.extend({
  defaults: {}
})

var Quizes = BaseCollection.extend({
  model: Quiz
})

exports.quizes = new Quizes()
