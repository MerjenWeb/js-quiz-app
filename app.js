'use strict';

const welcomeBox = document.querySelector('.welcome-box');
const levelBox = document.querySelector('.level-box');
const questionBox = document.querySelector('.question-box');
const categoryBox = document.querySelector('.category-box');

const selectCategory = document.getElementById('category');

const btnGo = document.querySelector('.btn-go');
const btnNext = document.querySelector('.next');
const btnsLevel = document.querySelectorAll('.btn-level');
const btnEasy = document.querySelector('.btn--easy');
const btnMid = document.querySelector('.btn--mid');
const btnHard = document.querySelector('.btn--hard');
const btnReset = document.querySelector('.btn-reset');

let currentQuestion = 0;
let correctAnswers = 0;
let selectedValue;
let timerContainer;

// Helper function - to replace HTML entity with normal symbols (when fetching API)
function decodeHTMLEntities(encodedString) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = encodedString;
  return textarea.value;
}

// Resetting
btnReset.addEventListener('click', function () {
  welcomeBox.style.display = 'none';
  categoryBox.style.display = 'block';
  levelBox.style.display = 'none';
  questionBox.style.display = 'none';
  questionBox.innerHTML = `<p class="loading-message"> Loading questions . . . ⌛️</p>`;
  btnReset.style.display = 'none';
  currentQuestion = 0;
  correctAnswers = 0;
  selectCategory.selectedIndex = 0;
  selectedValue = 'any';
});

// Hiding welcome message, showing "Category" box
btnGo.addEventListener('click', function () {
  welcomeBox.style.display = 'none';
  categoryBox.style.display = 'block';
  levelBox.style.display = 'none';
  selectedValue = 'any';
});

// The user selects a new option
selectCategory.addEventListener('change', function () {
  selectedValue = selectCategory.value;
});

// Hiding "Category" box, displaying "Choose the level" box
btnNext.addEventListener('click', function (e) {
  categoryBox.style.display = 'none';
  levelBox.style.display = 'block';
});

// Function that fetches API, clears the Question Box and displays the data, catches the error.
const getQuestions = function (url) {
  console.log('getQuestions');
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      questionBox.innerHTML = '';
      displayData(data);
    })
    .catch(error => {
      console.error('Error:', error);
      questionBox.innerHTML = `<p class="loading-message">${error}. Please try again later. ❌</p>`;
    });
};

// Hiding "Choose the level" box, displaying Question box
btnsLevel.forEach(btn => {
  btn.addEventListener('click', function () {
    levelBox.style.display = 'none';
    questionBox.style.display = 'block';
  });
});

btnsLevel.forEach(btn => {
  btn.addEventListener('click', async function () {
    try {
      const dif = btn.innerText.toLowerCase();
      const apiUrl = `https://opentdb.com/api.php?amount=10&${
        selectedValue === 'any' ? '' : `category=${selectedValue}&`
      }difficulty=${dif}&type=multiple`;
      const questions = await getQuestions(apiUrl);
      return questions;
    } catch (error) {
      console.error(error);
    }
  });
});

const displayData = function (data) {
  // Clear previous data in the container
  questionBox.innerHTML = '';

  const objectsArr = data.results;

  objectsArr.forEach((object, i) => {
    const answers = [...object.incorrect_answers, object.correct_answer].sort();

    // Assign the timer container globally
    timerContainer = questionBox.querySelector('#timer');

    const html = `
    <div class=${currentQuestion !== i ? 'non-active' : 'active'}>
    <div class="question-box-header green-font-color">
    <div id="timer">00:45</div>
      <p class="difficulty">${object.difficulty.toUpperCase()}</p>
    </div>
    <div class="question" data-content="${i + 1} / ${objectsArr.length}">
      <p><b>Question</b>: ${object.question}</p>
    </div>
    <div class="answers">
      ${answers
        .map(answer => {
          return `<button class="answer green-font-color">
        ${answer}
      </button>`;
        })
        .join('')}
    </div>
    <div class="current-score green-font-color">Current score: <strong>${correctAnswers}</strong>/${
      objectsArr.length
    }</div>
  </div>
    `;
    questionBox.insertAdjacentHTML('beforeend', html);
  });

  const answerBtns = document.querySelectorAll('.answer');
  let answerSelected = false; // It starts with a value of false indicating that no answer has been selected initially

  answerBtns.forEach((answer, i) => {
    answer.addEventListener('click', handleClick);
  });

  function handleClick(e) {
    if (answerSelected) {
      return;
    }

    answerSelected = true; // Set flag to true indicating answer selection

    const selectedAnswerEl = e.target;
    const selectedAnswerText = selectedAnswerEl.innerText.trim();
    const correctAnswer = objectsArr[currentQuestion].correct_answer;

    if (selectedAnswerEl.classList.contains('answer')) {
      answerBtns.forEach(btn => {
        btn.classList.remove('correct-answer', 'incorrect-answer');
        btn.disabled = true;
        btn.removeEventListener('click', handleClick);
        if (btn !== selectedAnswerEl) {
          btn.classList.add('disable-hover');
        }
      });
    }

    const cleanCorrectAnswer = decodeHTMLEntities(correctAnswer);

    if (selectedAnswerText === cleanCorrectAnswer) {
      selectedAnswerEl.classList.add('correct-answer');
      correctAnswers++;
    }
    if (selectedAnswerText !== cleanCorrectAnswer) {
      selectedAnswerEl.classList.add('incorrect-answer');
      const answerArr = Array.from(answerBtns);
      answerArr.filter(answer => {
        if (answer.innerText.trim() === cleanCorrectAnswer) {
          answer.classList.add('correct-answer');
        }
      });
    }

    setTimeout(() => {
      selectedAnswerEl.removeEventListener('click', handleClick);

      currentQuestion++;

      if (currentQuestion >= objectsArr.length) {
        // Quiz complete

        questionBox.innerHTML = `
          <div class="end-of-quiz">
          <p>Quiz complete! 🎉 </p>
          <p>You answered <b>${correctAnswers}</b> out of <b>${
          objectsArr.length
        }</b> questions correctly.
          <p>
          ${
            correctAnswers < 5
              ? `Good effort! Keep practicing and you'll see improvement in your scores! 💪🏼`
              : 'Great job! Keep it up! 👏🏼'
          }
          </p>
          </div>
          `;

        btnReset.style.display = 'inline-block';
      } else {
        displayData(data);
      }
    }, 600);
  }
};
