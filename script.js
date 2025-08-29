/**
 * EnglishMaster Academy - Full JS
 * Handles navigation, sections, dashboard, registration, quiz, payment, slider, modals, scroll-to-top, dictionary
 */

/* ---------------- SECTIONS ---------------- */
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
  "success-stories",
  "slider",
  "about",
  "signin",
];

function showSection(sectionId) {
  sections.forEach((id) => {
    const section = document.getElementById(id);
    if (section) section.classList.toggle("hidden", id !== sectionId);
  });
  if (window.innerWidth <= 480) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ---------------- NAVIGATION & SCROLL ---------------- */
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 50);

  const scrollIndicator = document.getElementById("scrollIndicator");
  if (scrollIndicator) {
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (window.scrollY / scrollHeight) * 100;
    scrollIndicator.style.width = `${scrollPercent}%`;
  }
});

/* ---------------- REGISTRATION ---------------- */
function completeRegistration(event) {
  event.preventDefault();
  const form = event.target;
  const buttonText = document.getElementById("register-btn-text");
  const loadingSpinner = document.getElementById("register-loading");
  const fullName = form.querySelector('input[type="text"]').value;

  buttonText.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");

  setTimeout(() => {
    showNotification("Registration successful!", "check-circle", "green");
    buttonText.classList.remove("hidden");
    loadingSpinner.classList.add("hidden");
    form.reset();
    showSection("dashboard");
    updateDashboardName(fullName);
  }, 1500);
}

function updateDashboardName(name) {
  const dashboardTitle = document.getElementById("dashboard-title");
  if (dashboardTitle) dashboardTitle.textContent = `Welcome back, ${name}`;
}

/* ---------------- NOTIFICATION ---------------- */
function showNotification(message, icon, color) {
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notificationText");
  const notificationIcon = document.getElementById("notificationIcon");
  if (!notification || !notificationText || !notificationIcon) return;

  notificationText.textContent = message;
  notificationIcon.className = `fas fa-${icon}`;
  notificationIcon.style.color = color;

  notification.style.display = "block";
  setTimeout(() => (notification.style.display = "none"), 2500);
}

/* ---------------- STATS COUNTER ---------------- */
function countUp() {
  const counters = document.querySelectorAll(".stats-counter");
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute("data-target")) || 0;
    let count = 0;
    const increment = target / 100;
    const duration = window.innerWidth <= 480 ? 10 : 20;

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

let audioSrc = null;

function searchWord() {
  const word = document.getElementById("dictionary-input").value.trim();
  const wordResult = document.getElementById("word-result");
  const wordTitle = document.getElementById("word-title");
  const wordPhonetic = document.getElementById("word-phonetic");
  const wordDefinition = document.getElementById("word-definition");
  const wordExample = document.getElementById("word-example");
  const wordSynonyms = document.getElementById("word-synonyms");

  if (!word) return alert("Please enter a word!");

  // CORS proxy URL
  const proxyUrl = "https://api.allorigins.win/get?url=";
  const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  fetch(proxyUrl + encodeURIComponent(apiUrl))
    .then((res) => res.json())
    .then((data) => {
      const wordData = JSON.parse(data.contents)[0];

      if (!wordData) {
        wordResult.classList.add("hidden");
        alert("Word not found. Try another.");
        return;
      }

      // Word title
      wordTitle.textContent = wordData.word;

      // Phonetic
      wordPhonetic.textContent = wordData.phonetic || "";

      // Definition
      const firstMeaning = wordData.meanings[0];
      wordDefinition.textContent = firstMeaning.definitions[0].definition || "";

      // Example
      wordExample.textContent =
        firstMeaning.definitions[0].example || "No example available.";

      // Synonyms
      wordSynonyms.innerHTML = firstMeaning.definitions[0].synonyms
        ? firstMeaning.definitions[0].synonyms
            .map((s) => `<span>${s}</span>`)
            .join(", ")
        : "No synonyms available.";

      // Pronunciation audio
      audioSrc = wordData.phonetics.find((p) => p.audio)?.audio || null;

      // Show result section
      wordResult.classList.remove("hidden");

      // Scroll into view on mobile
      if (window.innerWidth <= 480) {
        wordResult.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    })
    .catch((err) => {
      console.error(err);
      wordResult.classList.add("hidden");
      alert("Error fetching word data. Try again later.");
    });
}

// Play pronunciation
function playPronunciation() {
  if (audioSrc) {
    const audio = new Audio(audioSrc);
    audio.play();
  } else {
    alert("Audio not available for this word.");
  }
}

/* ---------------- QUIZ SYSTEM ---------------- */
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

let currentQuiz = null,
  currentQuestionIndex = 0,
  correctAnswers = 0,
  selectedAnswers = {},
  timerInterval,
  quizStartTime;

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

  startTimer(window.innerWidth <= 480 ? 120 : 150);
  showQuestion();
}

function showQuestion() {
  const q = currentQuiz[currentQuestionIndex];
  document.getElementById("current-question").textContent =
    currentQuestionIndex + 1;
  document.getElementById("question-text").textContent = q.question;

  const optionsContainer = document.getElementById("quiz-options");
  optionsContainer.innerHTML = q.options
    .map(
      (o, i) =>
        `<label><input type="radio" name="answer" value="${i}" ${
          selectedAnswers[currentQuestionIndex] === i ? "checked" : ""
        }/> ${o}</label>`
    )
    .join("");

  document.getElementById("prev-btn").disabled = currentQuestionIndex === 0;
  document.getElementById("next-btn").disabled = false;

  if (window.innerWidth <= 480)
    document
      .getElementById("quiz-questions")
      .scrollIntoView({ behavior: "smooth" });
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    saveAnswer();
    currentQuestionIndex--;
    showQuestion();
  }
}
function nextQuestion() {
  saveAnswer();
  if (selectedAnswers[currentQuestionIndex] !== undefined) {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
      showQuestion();
    } else {
      clearInterval(timerInterval);
      calculateResults();
    }
  } else
    showNotification("Please select an answer!", "exclamation-circle", "red");
}
function saveAnswer() {
  const sel = document.querySelector('input[name="answer"]:checked');
  if (sel) selectedAnswers[currentQuestionIndex] = parseInt(sel.value);
}
function startTimer(seconds) {
  let timeLeft = seconds;
  const tEl = document.getElementById("quiz-timer");
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const m = Math.floor(timeLeft / 60),
      s = timeLeft % 60;
    tEl.textContent = `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(timerInterval);
      calculateResults();
    }
  }, 1000);
}
function calculateResults() {
  correctAnswers = 0;
  currentQuiz.forEach((q, i) => {
    if (selectedAnswers[i] === q.correct) correctAnswers++;
  });
  showResults();
}
function showResults() {
  document.getElementById("quiz-questions").classList.add("hidden");
  document.getElementById("quiz-results").classList.remove("hidden");
  const score = Math.round((correctAnswers / currentQuiz.length) * 100);
  document.getElementById("final-score").textContent = `${score}%`;
  document.getElementById("correct-answers").textContent = correctAnswers;
  document.getElementById("incorrect-answers").textContent =
    currentQuiz.length - correctAnswers;
  const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60),
    seconds = elapsed % 60;
  document.getElementById("time-taken").textContent = `${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
  if (window.innerWidth <= 480)
    document
      .getElementById("quiz-results")
      .scrollIntoView({ behavior: "smooth" });
}
function restartQuiz() {
  document.getElementById("quiz-results").classList.add("hidden");
  document.getElementById("quiz-start").classList.remove("hidden");
}

/* ---------------- PAYMENT ---------------- */
function selectPlan(plan) {
  const price = plan === "basic" ? 19 : 39;
  document.getElementById("payment-form").classList.remove("hidden");
  document.getElementById("selected-plan").textContent = `${
    plan.charAt(0).toUpperCase() + plan.slice(1)
  } Plan`;
  document.getElementById("plan-price").textContent = `$${price.toFixed(2)}`;
  document.getElementById("subtotal").textContent = `$${price.toFixed(2)}`;
  const tax = (price * 0.2).toFixed(2);
  document.getElementById("tax-amount").textContent = `$${tax}`;
  const total = (price + parseFloat(tax)).toFixed(2);
  document.getElementById("total-price").textContent = `$${total}`;
  if (window.innerWidth <= 480)
    document
      .getElementById("payment-form")
      .scrollIntoView({ behavior: "smooth" });
}
function processPayment(e) {
  e.preventDefault();
  showNotification("Payment successful!", "check-circle", "green");
  setTimeout(
    () => document.getElementById("payment-form").classList.add("hidden"),
    2500
  );
}

/* ---------------- SLIDER ---------------- */
const slider = function () {
  const slides = document.querySelectorAll(".slide"),
    btnLeft = document.querySelector(".slider__btn--left"),
    btnRight = document.querySelector(".slider__btn--right"),
    dotContainer = document.querySelector(".dots");
  let curSlide = 0,
    maxSlide = slides.length,
    slideInterval;
  const createDots = () => {
    slides.forEach((_, i) => {
      dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };
  const activateDot = (s) => {
    document
      .querySelectorAll(".dots__dot")
      .forEach((dot) => dot.classList.remove("dots__dot--active"));
    document
      .querySelector(`.dots__dot[data-slide="${s}"]`)
      .classList.add("dots__dot--active");
  };
  const goToSlide = (s) =>
    slides.forEach(
      (sl, i) => (sl.style.transform = `translateX(${100 * (i - s)}%)`)
    );
  const nextSlide = () => {
    curSlide = curSlide === maxSlide - 1 ? 0 : curSlide + 1;
    goToSlide(curSlide);
    activateDot(curSlide);
  };
  const prevSlide = () => {
    curSlide = curSlide === 0 ? maxSlide - 1 : curSlide - 1;
    goToSlide(curSlide);
    activateDot(curSlide);
  };
  const startAutoSlide = () => (slideInterval = setInterval(nextSlide, 4000));
  const resetAutoSlide = () => {
    clearInterval(slideInterval);
    startAutoSlide();
  };
  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
    startAutoSlide();
  };
  init();
  btnRight.addEventListener("click", () => {
    nextSlide();
    resetAutoSlide();
  });
  btnLeft.addEventListener("click", () => {
    prevSlide();
    resetAutoSlide();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
      resetAutoSlide();
    }
    if (e.key === "ArrowRight") {
      nextSlide();
      resetAutoSlide();
    }
  });
  dotContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("dots__dot")) {
      curSlide = Number(e.target.dataset.slide);
      goToSlide(curSlide);
      activateDot(curSlide);
      resetAutoSlide();
    }
  });
};
slider();

/* ---------------- MODALS ---------------- */
function openModal(modalId) {
  const modal = document.getElementById(modalId),
    overlay = document.querySelector(".overlay");
  modal.classList.add("active");
  overlay.classList.add("active");
}
function closeModal(modalId) {
  const modal = document.getElementById(modalId),
    overlay = document.querySelector(".overlay");
  modal.classList.remove("active");
  overlay.classList.remove("active");
}
document.querySelector(".overlay")?.addEventListener("click", () => {
  document
    .querySelectorAll(".modal")
    .forEach((m) => m.classList.remove("active"));
  document.querySelector(".overlay").classList.remove("active");
});

/* ---------------- SCROLL TO TOP ---------------- */
const scrollBtn = document.getElementById("scrollToTop");
window.addEventListener("scroll", () => {
  scrollBtn?.classList.toggle("show", window.scrollY > 200);
});
scrollBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------------- MENU TOGGLE ---------------- */
const menuToggle = document.querySelector("#menuToggle"),
  navMenu = document.querySelector("#menu"),
  overlay = document.querySelector("#overlay"),
  icon = menuToggle.querySelector("i");
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  navMenu.classList.toggle("active");
  overlay.classList.toggle("active");
  icon.classList.toggle("fa-bars");
  icon.classList.toggle("fa-times");
});
overlay.addEventListener("click", () => {
  navMenu.classList.remove("active");
  overlay.classList.remove("active");
  icon.classList.remove("fa-times");
  icon.classList.add("fa-bars");
});
document.addEventListener("click", (e) => {
  if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  }
});
document.querySelectorAll(".menu-item").forEach((btn) =>
  btn.addEventListener("click", () => {
    navMenu.classList.remove("active");
    overlay.classList.remove("active");
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
  })
);

/* ---------------- INIT ---------------- */
function init() {
  countUp();
  document.getElementById("hero").classList.remove("hidden");

  if (window.innerWidth <= 480) {
    document.querySelectorAll("nav p, nav i, nav button").forEach((el) => {
      el.addEventListener("touchstart", () => el.classList.add("active"));
      el.addEventListener("touchend", () => el.classList.remove("active"));
    });
  }

  document.querySelectorAll("nav p").forEach((link) => {
    link.addEventListener("click", () => {
      showSection(link.textContent.toLowerCase().replace(/\s+/g, "-"));
    });
  });

  dictInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchWord();
  });
}
window.addEventListener("load", init);
