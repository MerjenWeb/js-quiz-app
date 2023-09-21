'use strict';

const welcomeBox = document.querySelector('.welcome-box');
const levelBox = document.querySelector('.level-box');
const categoryBox = document.querySelector('.category-box');
const questionBox = document.querySelector('.question-box');

const selectCategory = document.getElementById('category');

const btnGo = document.querySelector('.btn-go');
const btnNext = document.querySelector('.next');
const btnsLevel = document.querySelectorAll('.btn-level');
const btnReset = document.querySelector('.btn-reset');
const timer = document.querySelector('.timer');

let selectedValue;
let currentQuestion = 0;
let correctAnswers = 0;
let timerInterval;

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

// Function that fetches API, clears the Question Box and displays the data, catches the error.
async function getQuestions(url) {
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
}

// Function to start the timer
function startTimer(objectsArr, data, answerBtns) {
  let time = 25;

  clearInterval(timerInterval);
  timer.textContent = `00:${String(time).padStart(2, '0')}`;

  const tick = function () {
    time--;

    timer.textContent = `00:${String(time).padStart(2, '0')}`;

    if (time === 0) {
      const correctAnswer = objectsArr[currentQuestion].correct_answer;
      const correctAnswerButton = Array.from(answerBtns).find(
        btn => btn.innerText.trim() === decodeHTMLEntities(correctAnswer)
      );
      correctAnswerButton.classList.add('correct-answer');
      answerBtns.forEach(btn => {
        btn.disabled = true;
        btn.removeEventListener('click', handleClick);
      });
    }

    if (time < 0) {
      clearInterval(timerInterval);
      moveToNextQuestion(objectsArr, data);
    }
  };

  timerInterval = setInterval(tick, 1000);
}

function displayData(data) {
  // Clear previous data in the container
  questionBox.innerHTML = '';
  const objectsArr = data.results;

  objectsArr.forEach((object, i) => {
    const html = generateQuestionTemplate(data, objectsArr, object, i);
    questionBox.insertAdjacentHTML('beforeend', html);
  });

  const answerBtns = document.querySelectorAll('.answer');
  let answerSelected = false; // It starts with a value of false indicating that no answer has been selected initially

  startTimer(objectsArr, data, answerBtns);

  answerBtns.forEach((answer, i) => {
    answer.addEventListener('click', e =>
      handleClick(e, data, answerSelected, objectsArr, answerBtns)
    );
  });
}

// Function that generates the HTML template for each question and returns it
function generateQuestionTemplate(data, objectsArr, object, i) {
  const answers = [...object.incorrect_answers, object.correct_answer].sort();
  timer.style.display = 'inline';

  return `
  <div class=${currentQuestion !== i ? 'non-active' : 'active'}>
  <div class="question-box-header green-font-color">
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
}

function handleClick(e, data, answerSelected, objectsArr, answerBtns) {
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
    moveToNextQuestion(objectsArr, data);
  }, 600);
}

// Helper function - to replace HTML entity with normal symbols (when fetching API)
function decodeHTMLEntities(encodedString) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = encodedString;
  return textarea.value;
}

function moveToNextQuestion(objectsArr, data) {
  currentQuestion++;
  clearInterval(timerInterval);
  if (currentQuestion >= objectsArr.length) {
    handleQuizCompletion(objectsArr);
  } else {
    displayData(data);
  }
}

// Quiz complete
function handleQuizCompletion(objectsArr) {
  clearInterval(timerInterval);
  timer.textContent = '';
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
}

// Resetting
btnReset.addEventListener('click', function () {
  clearInterval(timerInterval);
  timer.style.display = 'none';
  welcomeBox.style.display = 'none';
  levelBox.style.display = 'none';
  questionBox.style.display = 'none';
  btnReset.style.display = 'none';
  categoryBox.style.display = 'block';
  selectCategory.selectedIndex = 0;
  selectedValue = 'any';
  questionBox.innerHTML = `<p class="loading-message"> Loading questions . . . ⌛️</p>`;
  currentQuestion = 0;
  correctAnswers = 0;
});
