var parse = function (req) {
  var result
  try {
    result = JSON.parse(req.responseText)
  } catch (e) {
    result = req.responseText
  }
  return [result, req]
}

var xhr = function (type, url, data) {
  var methods = {
    success: function(){},
    error: function(){}
  }
  var XHR = window.XMLHttpRequest || ActiveXObject
  var request = new XHR('MSXML2.XMLHTTP.3.0')
  request.open(type, url, true)
  request.setRequestHeader('Content-type', 'application/json; charset=utf-8')
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status === 200)
        methods.success.apply(methods, parse(request))
      else
        methods.error.apply(methods, parse(request))
    }
  }
  request.send(data)
  return {
    success: function (callback) {
      methods.success = callback
      return methods
    },
    error: function (callback) {
      methods.error = callback
      return methods
    }
  }
}

exports.post = function(url, data) {
  return xhr('POST', url, JSON.stringify(data))
}
exports.get = function(url) {
  return xhr('GET', url)
}
