'use strict';

const welcomeBox = document.querySelector('.welcome-box');
const btnGo = document.querySelector('.btn-go');
const levelBox = document.querySelector('.level-box');
const btnsLevel = document.querySelectorAll('.btn-level');
const btnEasy = document.querySelector('.btn--easy');
const btnMid = document.querySelector('.btn--mid');
const btnHard = document.querySelector('.btn--hard');
const questionBox = document.querySelector('.question-box');
const resetBtn = document.querySelector('.btn-reset');
let currentQuestion = 0;
let correctAnswers = 0;

// Resetting
resetBtn.addEventListener('click', function () {
  welcomeBox.style.display = 'none';
  levelBox.style.display = 'block';
  questionBox.style.display = 'none';
  questionBox.innerHTML = `<p class="loading-message"> Loading questions . . . ⌛️</p>`;
  resetBtn.style.display = 'none';
  currentQuestion = 0;
  correctAnswers = 0;
});

// Hiding welcome message, showing "Choose the level" box
btnGo.addEventListener('click', function () {
  welcomeBox.style.display = 'none';
  levelBox.style.display = 'block';
});

// Hiding "Choose the level" box, displaying Question box
btnsLevel.forEach(btn => {
  btn.addEventListener('click', function () {
    levelBox.style.display = 'none';
    questionBox.style.display = 'block';
  });
});

function init() {
  // Function that fetches API, clears the Question Box and displays the data, catches the error.
  const getQuestions = function (url) {
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
  //  Fetch API according to these event listeners
  btnEasy.addEventListener('click', function () {
    return getQuestions(
      'https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple'
    );
  });

  btnMid.addEventListener('click', function () {
    return getQuestions(
      'https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple'
    );
  });

  btnHard.addEventListener('click', function () {
    return getQuestions(
      'https://opentdb.com/api.php?amount=10&category=18&difficulty=hard&type=multiple'
    );
  });

  // Displaying the data
  const displayData = function (data) {
    // Clear previous data in the container
    questionBox.innerHTML = '';

    const objectsArr = data.results; // an array of question objects

    objectsArr.forEach((object, i) => {
      const answers = [
        ...object.incorrect_answers,
        object.correct_answer,
      ].sort();

      const html = `
      <div class=${currentQuestion !== i ? 'non-active' : 'active'}>
      <div class="question-box-header">
        <p class="timer">00:30</p>
        <p class="difficulty">${object.difficulty.toUpperCase()}</p>
      </div>
      <div class="question" data-content="${i + 1} / ${objectsArr.length}">
        <p><b>Question</b>: ${object.question}</p>
      </div>
      <div class="answers">
        ${answers
          .map(answer => {
            return `<button class="answer">
          ${answer}
        </button>`;
          })
          .join('')}
      </div>
    </div>
      `;
      questionBox.insertAdjacentHTML('beforeend', html);
    });

    const answerBtns = document.querySelectorAll('.answer');
    let answerSelected = false; // It starts with a value of false indicating that no answer has been selected initially

    answerBtns.forEach((answer, i) => {
      answer.addEventListener('click', handleClick);
    });

    // before the click i need the time to be running
    // after the click i need to reset the time and start it over

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

      if (selectedAnswerText === correctAnswer) {
        selectedAnswerEl.classList.add('correct-answer');
        correctAnswers++;
      }
      if (selectedAnswerText !== correctAnswer) {
        selectedAnswerEl.classList.add('incorrect-answer');
        const answerArr = Array.from(answerBtns);
        answerArr.filter(answer => {
          if (answer.innerText.trim() === correctAnswer) {
            answer.classList.add('correct-answer');
          }
        });
      }

      //add the message for 10 out of 10 and 0 out of ten
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

          resetBtn.style.display = 'inline-block';
        } else {
          displayData(data);
        }
      }, 600);
    }
  };
}

init();
