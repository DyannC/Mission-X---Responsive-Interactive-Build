document.addEventListener("DOMContentLoaded", () => {

  // --------- LOGIN FORM ---------
  const loginForm = document.querySelector(".login-form");
  const signupBtn = document.querySelector(".signup-btn");

  if (loginForm) {
    const emailInput = loginForm.querySelector('input[placeholder="Email"]');
    const passwordInput = loginForm.querySelector('input[placeholder="Password"]');

    // -----------------
    // Live validation
    // -----------------
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

    // -----------------
    // Submit validation + Mock API login
    // -----------------
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      let hasError = false;

      [emailInput, passwordInput].forEach(i => {
        i.classList.remove("error");
        i.nextElementSibling.classList.remove("active");
      });

      // Email validation
      if (emailInput.value.trim() === "" || !validateEmail(emailInput.value)) {
        emailInput.classList.add("error");
        emailInput.nextElementSibling.textContent = emailInput.value.trim() === "" ?
          "Please enter your email" : "Enter a valid email address";
        emailInput.nextElementSibling.classList.add("active");
        hasError = true;
      }

      // Password validation
      if (passwordInput.value.trim() === "" || passwordInput.value.length < 8) {
        passwordInput.classList.add("error");
        passwordInput.nextElementSibling.textContent = passwordInput.value.trim() === "" ?
          "Please enter your password" : "Password must be at least 8 characters";
        passwordInput.nextElementSibling.classList.add("active");
        hasError = true;
      }

      // If all valid, check Mock API
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

    // Signup button
    if (signupBtn) signupBtn.addEventListener("click", () => window.location.href = "signup.html");
  }

  // --------- SIGN OUT BUTTON (progress-report-page) ---------
  const signoutBtn = document.getElementById("signout-btn");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", () => {
      // Optional debug alert
      // alert("Sign out clicked!");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }

});


// New Report button / Sumit another issue

// Select the button
const newReportBtn = document.getElementById("submit");

// Add a click event listener
newReportBtn.addEventListener("click", function () {
  // Redirect to issue type page
  window.location.href = "issuetype.html";
});