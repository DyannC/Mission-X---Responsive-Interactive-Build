// --------------------
// SIGN UP SCRIPT
// --------------------

document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector(".signup-form");

  const firstName = signupForm.querySelector('input[placeholder="First name"]');
  const lastName = signupForm.querySelector('input[placeholder="Last name"]');
  const emailPhone = signupForm.querySelector('input[placeholder="Email or Phone"]');
  const password = signupForm.querySelector('input[placeholder="Password"]');
  const confirmPassword = signupForm.querySelector('input[placeholder="Confirm password"]');

  // ✅ Validation helpers
  function validateEmailPhone(value) {
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
    const phonePattern = /^[0-9]{7,15}$/;
    return emailPattern.test(value) || phonePattern.test(value);
  }

  function liveValidate(input) {
    let isValid = true;

    if (input === firstName || input === lastName) {
      isValid = input.value.trim() !== "";
    } else if (input === emailPhone) {
      isValid = validateEmailPhone(input.value.trim());
    } else if (input === password) {
      isValid = input.value.length >= 8;
    } else if (input === confirmPassword) {
      isValid = input.value === password.value && input.value.length >= 8;
    }

    input.classList.toggle("valid", isValid);
    input.classList.toggle("error", !isValid);
  }

  // ✅ Live validation events
  [firstName, lastName, emailPhone, password, confirmPassword].forEach(input => {
    input.addEventListener("input", () => liveValidate(input));
  });

  // ✅ On form submit
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    let hasError = false;

    // Reset error messages
    const errorMessages = signupForm.querySelectorAll(".error-message");
    errorMessages.forEach(e => e.classList.remove("active"));

    // First name
    if (firstName.value.trim() === "") {
      firstName.classList.add("error");
      firstName.nextElementSibling.classList.add("active");
      hasError = true;
    }

    // Last name
    if (lastName.value.trim() === "") {
      lastName.classList.add("error");
      lastName.nextElementSibling.classList.add("active");
      hasError = true;
    }

    // Email or Phone
    if (!validateEmailPhone(emailPhone.value.trim())) {
      emailPhone.classList.add("error");
      emailPhone.nextElementSibling.classList.add("active");
      hasError = true;
    }

    // Password
    if (password.value.length < 8) {
      password.classList.add("error");
      password.nextElementSibling.classList.add("active");
      hasError = true;
    }

    // Confirm password
    if (confirmPassword.value !== password.value || confirmPassword.value.length < 8) {
      confirmPassword.classList.add("error");
      confirmPassword.nextElementSibling.textContent = "Passwords do not match";
      confirmPassword.nextElementSibling.classList.add("active");
      hasError = true;
    }

    // ✅ Success: redirect
    if (!hasError) {
      alert("Successfully registered 🎉");
      window.location.href = "success-overlay-page.html";
    }
  });
});


// Back to Login button

document.addEventListener("DOMContentLoaded", () => {
        const backBtn = document.getElementById("backToLoginBtn");
        backBtn.addEventListener("click", () => {
          window.location.href = "login.html";
        });
      });