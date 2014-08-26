(function(A,I,N,O) {
  var d = document
  O = 0
  N = "lib.css app.css lib.js app.js".split(' ')
  b()
  function b() {
    I = /\.css/.test(N[O])
    A = d.createElement(I ? "link" : "script")
    A[I ? "href" : "src"] = '/assets/'+N[O]
    d.getElementsByTagName('head')[0].appendChild(A)
    if (I) {
      A.rel = "stylesheet"
      O++
      b()
    } else A.onload = A.onreadystatechange = function() {
      var s=this.readyState
      if( !this.l && ( !s || s=='loaded' || s=='complete' ) ) {
        this.l=1;
        ++O == N.length ? (function() {
          if (d.readyState && d.readyState === "complete") Run()
          else window.onload = Run
        }()) : b()
      }
    }
  }
}())