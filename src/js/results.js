
module.exports = function(answers) {
	var score = 0
	answers.forEach(function(answer) {
    if ( answer.score ) {
      score += answer.score*500
      score += answer.timescore*300
    }
  })
  return Math.round(score)
}