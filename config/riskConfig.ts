export const paybackScoreTable = [{
  min: 0,
  max: 6,
  score: 100
}, {
  min: 7,
  max: 13,
  score: 80
}, {
  min: 14,
  max: 20,
  score: 60
}, {
  min: 21,
  max: 27,
  score: 30
}, {
  min: 28,
  max: 99999,
  score: 10
}]
export const LTV_CACScoreTable = [{
  min: 3.0,
  max: 99999,
  score: 100
}, {
  min: 2.5,
  max: 2.99,
  score: 80
}, {
  min: 2.0,
  max: 2.49,
  score: 60
}, {
  min: 1.5,
  max: 1.99,
  score: 30
}, {
  min: 0,
  max: 1.49,
  score: 10
}]

export const riskTable = [{
  min: 85,
  max: 999,
  score: 1,
  label: 'Undoubted'
}, {
  min: 65,
  max: 84,
  score: 2,
  label: 'Low'
}, {
  min: 45,
  max: 64,
  score: 3,
  label: 'Moderate'
}, {
  min: 25,
  max: 44,
  score: 4,
  label: 'Cautionary'
}, {
  min: 15,
  max: 24,
  score: 5,
  label: 'Unsatisfactory'
}, {
  min: 0,
  max: 14,
  score: 6,
  label: 'Unacceptable'
}]
