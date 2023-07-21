'use strict';

const goBtn = document.querySelector('.btn-go');
const welcomeBox = document.querySelector('.welcome-box');
const levelBox = document.querySelector('.level-box');

// Events
goBtn.addEventListener('click', function () {
  welcomeBox.style.display = 'none';
  levelBox.style.display = 'block';
});
console.log(goBtn);

// API
const getQuestions = async function (url) {
  await fetch(url)
    .then(response => response.json())
    .then(data => console.log(data.results))
    .catch(err => console.error(err));
};

const easy = getQuestions(
  'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple'
);

const middle = getQuestions(
  'https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple'
);

const hard = getQuestions(
  'https://opentdb.com/api.php?amount=10&category=9&difficulty=hard&type=multiple'
);

// const questionCard = function (obj) {
//   const html = `
//   <div class="questionCard"></div>
//   `;
// };

// console.log(easy, middle, hard);
