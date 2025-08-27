/**
 * EnglishMaster Academy JavaScript
 * Enhanced for mobile and desktop responsiveness
 * Handles section navigation, notifications, counters, dictionary, quiz, and payment
 */

const sections = [
  "hero",
  "features-overview",
  "dashboard",
  "courses",
  "dictionary",
  "live-classes",
  "quiz",
  "payment",
  "register",
];

/**
 * Shows a specific section and hides others
 * @param {string} sectionId - ID of the section to show
 */
function showSection(sectionId) {
  sections.forEach((id) => {
    const section = document.getElementById(id);
    if (section) {
      section.classList.toggle("hidden", id !== sectionId);
    }
  });

  // Scroll to top of section on mobile for better UX
  if (window.innerWidth <= 480) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Updates navigation bar on scroll
 */
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 50) {
    nav.classList.add("scrolled");
  } else {
    nav.classList.remove("scrolled");
  }

  // Update scroll progress indicator
  const scrollIndicator = document.getElementById("scrollIndicator");
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (window.scrollY / scrollHeight) * 100;
  scrollIndicator.style.width = `${scrollPercent}%`;
});

/**
 * Handles registration form submission
 * @param {Event} event - Form submission event
 */
function completeRegistration(event) {
  event.preventDefault();
  const buttonText = document.getElementById("register-btn-text");
  const loadingSpinner = document.getElementById("register-loading");

  buttonText.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");

  setTimeout(() => {
    showNotification("Registration successful!", "check-circle", "green");
    buttonText.classList.remove("hidden");
    loadingSpinner.classList.add("hidden");
    event.target.reset();
  }, 1500); // Reduced timeout for faster feedback on mobile
}

/**
 * Displays a notification with message, icon, and color
 * @param {string} message - Notification message
 * @param {string} icon - Font Awesome icon name
 * @param {string} color - Icon color
 */
function showNotification(message, icon, color) {
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notificationText");
  const notificationIcon = document.getElementById("notificationIcon");

  notificationText.textContent = message;
  notificationIcon.className = `fas fa-${icon}`;
  notificationIcon.style.color = color;

  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 2500); // Slightly shorter duration for mobile UX
}

/**
 * Animates stats counters
 */
function countUp() {
  const counters = document.querySelectorAll(".stats-counter");
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute("data-target")) || 0;
    let count = 0;
    const increment = target / 100;
    const duration = window.innerWidth <= 480 ? 10 : 20; // Faster animation on mobile

    const updateCounter = () => {
      if (count < target) {
        count += increment;
        counter.textContent = Math.floor(count).toLocaleString();
        setTimeout(updateCounter, duration);
      } else {
        counter.textContent = target.toLocaleString();
      }
    };
    updateCounter();
  });
}

/**
 * Searches for a word in the dictionary
 */
function searchWord() {
  const input = document
    .getElementById("dictionary-input")
    .value.trim()
    .toLowerCase();
  const wordResult = document.getElementById("word-result");
  const wordTitle = document.getElementById("word-title");
  const wordPhonetic = document.getElementById("word-phonetic");
  const wordDefinition = document.getElementById("word-definition");
  const wordExample = document.getElementById("word-example");
  const wordSynonyms = document.getElementById("word-synonyms");

  const dictionary = {
    serendipity: {
      phonetic: "/ˌserənˈdipədē/",
      definition:
        "The occurrence of finding something valuable when least expected.",
      example: "Meeting her by chance at the café was pure serendipity.",
      synonyms: ["fortune", "luck", "happy accident"],
    },
    eloquent: {
      phonetic: "/ˈeləkwənt/",
      definition: "Fluent or persuasive in speaking or writing.",
      example: "Her eloquent speech captivated the audience.",
      synonyms: ["articulate", "expressive", "fluent"],
    },
    ubiquitous: {
      phonetic: "/yo͞oˈbikwədəs/",
      definition: "Present, appearing, or found everywhere.",
      example: "Smartphones are ubiquitous in modern society.",
      synonyms: ["everywhere", "omnipresent", "widespread"],
    },
    ephemeral: {
      phonetic: "/əˈfem(ə)rəl/",
      definition: "Lasting for a very short time.",
      example: "The beauty of the sunset was ephemeral, fading quickly.",
      synonyms: ["transient", "fleeting", "short-lived"],
    },
  };

  if (dictionary[input]) {
    const word = dictionary[input];
    wordTitle.textContent = input.charAt(0).toUpperCase() + input.slice(1);
    wordPhonetic.textContent = word.phonetic;
    wordDefinition.textContent = word.definition;
    wordExample.textContent = word.example;
    wordSynonyms.innerHTML = word.synonyms
      .map((syn) => `<span>${syn}</span>`)
      .join(", ");
    wordResult.classList.remove("hidden");

    // Auto-scroll to result on mobile
    if (window.innerWidth <= 480) {
      wordResult.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } else {
    showNotification("Word not found!", "exclamation-circle", "red");
    wordResult.classList.add("hidden");
  }
}

/**
 * Searches for a specific word
 * @param {string} word - Word to search
 */
function searchSpecificWord(word) {
  document.getElementById("dictionary-input").value = word;
  searchWord();
}

/**
 * Plays word pronunciation
 * @param {string} word - Word to pronounce
 */
function playPronunciation(word) {
  if (word) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = window.innerWidth <= 480 ? 0.9 : 1.0; // Slightly slower on mobile
    speechSynthesis.speak(utterance);
  } else {
    showNotification("Please enter a word first!", "volume-up", "blue");
  }
}

// ---------------- QUIZ SYSTEM ----------------

const quizData = {
  grammar: [
    {
      question: "Which sentence is correct?",
      options: [
        "She go to school every day.",
        "She goes to school every day.",
        "She going to school every day.",
        "She gone to school every day.",
      ],
      correct: 1,
    },
    {
      question: "What is the past tense of 'run'?",
      options: ["Ran", "Run", "Runned", "Running"],
      correct: 0,
    },
  ],
  vocabulary: [
    {
      question: "What does 'benevolent' mean?",
      options: ["Kind", "Angry", "Sad", "Tired"],
      correct: 0,
    },
    {
      question: "What is a synonym for 'big'?",
      options: ["Small", "Large", "Tiny", "Little"],
      correct: 1,
    },
  ],
  mixed: [
    {
      question: "Choose the correct article: ___ apple.",
      options: ["A", "An", "The", "No article"],
      correct: 1,
    },
    {
      question: "What does 'ephemeral' mean?",
      options: ["Permanent", "Short-lived", "Bright", "Loud"],
      correct: 1,
    },
  ],
};

let currentQuiz = null;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let selectedAnswers = {};
let timerInterval;
let quizStartTime;

/**
 * Starts a quiz of the specified type
 * @param {string} type - Quiz type (grammar, vocabulary, mixed)
 */
function startQuiz(type) {
  currentQuiz = quizData[type];
  if (!currentQuiz)
    return showNotification("Quiz not found!", "exclamation-circle", "red");

  currentQuestionIndex = 0;
  correctAnswers = 0;
  selectedAnswers = {};
  quizStartTime = Date.now();

  document.getElementById("quiz-start").classList.add("hidden");
  document.getElementById("quiz-questions").classList.remove("hidden");
  document.getElementById("quiz-results").classList.add("hidden");
  document.getElementById("total-questions").textContent = currentQuiz.length;

  startTimer(window.innerWidth <= 480 ? 120 : 150); // Shorter timer on mobile
  showQuestion();
}

/**
 * Displays the current quiz question
 */
function showQuestion() {
  const question = currentQuiz[currentQuestionIndex];
  document.getElementById("current-question").textContent =
    currentQuestionIndex + 1;
  document.getElementById("question-text").textContent = question.question;

  const optionsContainer = document.getElementById("quiz-options");
  optionsContainer.innerHTML = question.options
    .map(
      (option, index) => `
        <label>
          <input type="radio" name="answer" value="${index}" 
          ${selectedAnswers[currentQuestionIndex] === index ? "checked" : ""}/>
          ${option}
        </label>`
    )
    .join("");

  document.getElementById("prev-btn").disabled = currentQuestionIndex === 0;
  document.getElementById("next-btn").disabled =
    !selectedAnswers[currentQuestionIndex];

  // Auto-scroll to question on mobile
  if (window.innerWidth <= 480) {
    document
      .getElementById("quiz-questions")
      .scrollIntoView({ behavior: "smooth" });
  }
}

/**
 * Navigates to the previous question
 */
function previousQuestion() {
  if (currentQuestionIndex > 0) {
    saveAnswer();
    currentQuestionIndex--;
    showQuestion();
  }
}

/**
 * Navigates to the next question or shows results
 */
function nextQuestion() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  if (selectedOption) {
    saveAnswer();
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
      showQuestion();
    } else {
      clearInterval(timerInterval);
      calculateResults();
    }
  } else {
    showNotification("Please select an answer!", "exclamation-circle", "red");
  }
}

/**
 * Saves the selected answer
 */
function saveAnswer() {
  const selectedOption = document.querySelector('input[name="answer"]:checked');
  if (selectedOption) {
    selectedAnswers[currentQuestionIndex] = parseInt(selectedOption.value);
  }
}

/**
 * Starts the quiz timer
 * @param {number} seconds - Timer duration
 */
function startTimer(seconds) {
  let timeLeft = seconds;
  const timerElement = document.getElementById("quiz-timer");
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      calculateResults();
    }
  }, 1000);
}

/**
 * Calculates quiz results
 */
function calculateResults() {
  correctAnswers = 0;
  currentQuiz.forEach((q, index) => {
    if (selectedAnswers[index] === q.correct) correctAnswers++;
  });
  showResults();
}

/**
 * Displays quiz results
 */
function showResults() {
  document.getElementById("quiz-questions").classList.add("hidden");
  document.getElementById("quiz-results").classList.remove("hidden");

  const score = Math.round((correctAnswers / currentQuiz.length) * 100);
  document.getElementById("final-score").textContent = `${score}%`;
  document.getElementById("correct-answers").textContent = correctAnswers;
  document.getElementById("incorrect-answers").textContent =
    currentQuiz.length - correctAnswers;

  const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  document.getElementById("time-taken").textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Auto-scroll to results on mobile
  if (window.innerWidth <= 480) {
    document
      .getElementById("quiz-results")
      .scrollIntoView({ behavior: "smooth" });
  }
}

//  * Restarts the quiz

function restartQuiz() {
  document.getElementById("quiz-results").classList.add("hidden");
  document.getElementById("quiz-start").classList.remove("hidden");
}

/**
 * Selects a payment plan
 * @param {string} plan - Plan type (basic, premium)
 */
function selectPlan(plan) {
  document.getElementById("payment-form").classList.remove("hidden");
  document.getElementById("selected-plan").textContent =
    plan.charAt(0).toUpperCase() + plan.slice(1) + " Plan";

  const price = plan === "premium" ? 19.0 : 39.0;
  document.getElementById("plan-price").textContent = `$${price.toFixed(2)}`;
  document.getElementById("subtotal").textContent = `$${price.toFixed(2)}`;

  const tax = (price * 0.2).toFixed(2);
  document.getElementById("tax-amount").textContent = `$${tax}`;

  const total = (price + parseFloat(tax)).toFixed(2);
  document.getElementById("total-price").textContent = `$${total}`;

  // Auto-scroll to payment form on mobile
  if (window.innerWidth <= 480) {
    document
      .getElementById("payment-form")
      .scrollIntoView({ behavior: "smooth" });
  }
}

//  * Processes payment

function processPayment(event) {
  event.preventDefault();
  showNotification("Payment successful!", "check-circle", "green");
  setTimeout(() => {
    document.getElementById("payment-form").classList.add("hidden");
  }, 2500);
}

//  * Initializes the page

function init() {
  countUp();
  document.getElementById("hero").classList.remove("hidden");

  // Add touch event listeners for mobile
  if (window.innerWidth <= 480) {
    document.querySelectorAll("nav p, nav i, nav button").forEach((el) => {
      el.addEventListener("touchstart", () => el.classList.add("active"));
      el.addEventListener("touchend", () => el.classList.remove("active"));
    });
  }

  // Add click event listeners for navigation
  document.querySelectorAll("nav p").forEach((link) => {
    link.addEventListener("click", () => {
      const sectionId = link.textContent.toLowerCase().replace(" ", "-");
      showSection(sectionId);
    });
  });

  // Add keyboard accessibility for dictionary input
  document
    .getElementById("dictionary-input")
    ?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") searchWord();
    });
}

// Initialize on page load
window.addEventListener("load", init);
const menuToggle = document.querySelector("#menuToggle");
const navMenu = document.querySelector("#menu");
const overlay = document.querySelector("#overlay");
const icon = menuToggle.querySelector("i"); // get the <i> inside button

// Toggle menu
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  navMenu.classList.toggle("active");
  overlay.classList.toggle("active");

  // Swap icon: bars ↔ times (X)
  if (icon.classList.contains("fa-bars")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Close menu when overlay is clicked
overlay.addEventListener("click", () => {
  navMenu.classList.remove("active");
  overlay.classList.remove("active");
  icon.classList.remove("fa-times");
  icon.classList.add("fa-bars");
});

// Close menu when clicking outside of menu
document.addEventListener("click", (e) => {
  if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});

// Close menu when a menu item is clicked
document.querySelectorAll(".menu-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  });
});
