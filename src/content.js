document.addEventListener("DOMContentLoaded", () => {
  const toggleInput = document.getElementById("toggleMode");
  const toggleLabel = document.getElementById("toggleLabel");
  let mode = "Less";
  toggleInput.addEventListener("change", () => {
    mode = toggleInput.checked ? "More" : "Less";
    toggleLabel.textContent = mode;
  });
});

function setScore(score) {
  const circle = document.querySelector('.circle');
  const scoreValue = document.querySelector('.score-value');
  
  circle.style.setProperty('--score', score);
  scoreValue.textContent = score;
}


document.addEventListener("DOMContentLoaded", function () {
  
});
