// ADAPTIVE DIFFICULTY (interview me ye bolna):
// Har answer ke score se agle question ka level (1-10) tay hota hai.
// Achha kiya to mushkil, kamzor kiya to aasan. Level 1 se 10 ke bahar nahi jata.
// Ye pure function hai (database ya AI nahi chahiye), isliye iske tests likhna aasan hai.
function nextLevel(current, score) {
  let delta;
  if (score >= 8) delta = 2;
  else if (score >= 6) delta = 1;
  else if (score >= 4) delta = 0;
  else if (score >= 2) delta = -1;
  else delta = -2;

  return Math.min(10, Math.max(1, current + delta));
}

module.exports = { nextLevel };