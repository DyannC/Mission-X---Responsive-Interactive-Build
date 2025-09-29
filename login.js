document.addEventListener("DOMContentLoaded", () => {

  // --------- LOGIN FORM ---------
  const loginForm = document.querySelector(".login-form");
  const signupBtn = document.querySelector(".signup-btn");

  if (loginForm) {
    const emailInput = loginForm.querySelector('input[placeholder="Email"]');
    const passwordInput = loginForm.querySelector('input[placeholder="Password"]');

    function validateEmail(email) {
      const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
      return pattern.test(email);
    }

    function liveValidate(input) {
      if (input.value.trim() === "") input.classList.remove("valid");
      else if (input === emailInput) input.classList.toggle("valid", validateEmail(input.value));
      else if (input === passwordInput) input.classList.toggle("valid", input.value.length >= 8);
    }

    emailInput.addEventListener("input", () => liveValidate(emailInput));
    passwordInput.addEventListener("input", () => liveValidate(passwordInput));

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      let hasError = false;

      [emailInput, passwordInput].forEach(i => {
        i.classList.remove("error");
        i.nextElementSibling.classList.remove("active");
      });

      if (emailInput.value.trim() === "" || !validateEmail(emailInput.value)) {
        emailInput.classList.add("error");
        emailInput.nextElementSibling.textContent =
          emailInput.value.trim() === "" ? "Please enter your email" : "Enter a valid email address";
        emailInput.nextElementSibling.classList.add("active");
        hasError = true;
      }

      if (passwordInput.value.trim() === "" || passwordInput.value.length < 8) {
        passwordInput.classList.add("error");
        passwordInput.nextElementSibling.textContent =
          passwordInput.value.trim() === "" ? "Please enter your password" : "Password must be at least 8 characters";
        passwordInput.nextElementSibling.classList.add("active");
        hasError = true;
      }

      if (!hasError) {
        try {
          const res = await fetch("https://68ca9796430c4476c34a1c61.mockapi.io/api/fixitapp/users");
          const users = await res.json();
          const user = users.find(u => u.email === emailInput.value && u.password === passwordInput.value);

          if (user) {
            localStorage.setItem("token", "loggedIn");
            window.location.href = "progress-report-page.html";
          } else {
            alert("Invalid email or password!");
          }
        } catch (err) {
          console.error(err);
          alert("Network error. Please try again later.");
        }
      }
    });

    if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "signup.html");
  }

  // --------- SIGN OUT BUTTON ---------
  const signoutBtn = document.getElementById("signout-btn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }

  // --------- NEW REPORT BUTTON ---------
  const newReportBtn = document.getElementById("submit");
  if (newReportBtn) {
    newReportBtn.addEventListener("click", () => {
      window.location.href = "issuetype.html";
    });
  }

  // --------- DARK MODE TOGGLE ---------
  const toggle = document.getElementById("cb1");
  const body = document.body;
  const dayIcon = document.getElementById("dayIcon");
  const nightIcon = document.getElementById("nightIcon");

   // 🧠 Load the saved theme (persists across pages)
  const savedMode = localStorage.getItem("themeMode");

  if (savedMode === "night") {
    body.classList.add("night-background");
    toggle.checked = true;
    dayIcon.style.display = "none";
    nightIcon.style.display = "inline-block";
  } else {
    body.classList.add("day-background");
    toggle.checked = false;
    dayIcon.style.display = "inline-block";
    nightIcon.style.display = "none";
  }

  // 🌓 Save theme when user toggles
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.remove("day-background");
      body.classList.add("night-background");
      dayIcon.style.display = "none";
      nightIcon.style.display = "inline-block";
      localStorage.setItem("themeMode", "night"); // 💾 remember
    } else {
      body.classList.remove("night-background");
      body.classList.add("day-background");
      nightIcon.style.display = "none";
      dayIcon.style.display = "inline-block";
      localStorage.setItem("themeMode", "day"); // 💾 remember
    }
  });
});


// --------- REFEENCE NUMBER (CONFIRMATION PAGE) ---------

const refNumberEl = document.getElementById("refNumber");
  const copyRefBtn = document.getElementById("copyRefBtn");

  // Generate random reference number (e.g. REF-384726)
  const randomRef = "REF-" + Math.floor(100000 + Math.random() * 900000);
  refNumberEl.textContent = randomRef;

  // Copy to clipboard
  copyRefBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(randomRef)
      .then(() => {
        copyRefBtn.textContent = "Copied!";
        setTimeout(() => copyRefBtn.textContent = "Copy", 1500);
      })
      .catch(err => console.error("Failed to copy:", err));
  });
