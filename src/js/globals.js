
var unloadMessage = ''

exports.setUnloadMessage = function(getMessage) {
  if ( typeof getMessage == 'function' ) {
    unloadMessage = getMessage()
    //window.onbeforeunload = getMessage
  }
}

exports.getUnloadMessage = function() {
  return unloadMessage
}

exports.clearUnload = function() {
  window.onbeforeunload = null
  unloadMessage = ''
}