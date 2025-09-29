// --------------------
// SIGN UP SCRIPT
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.querySelector(".signup-form");

  if (!signupForm) return;

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

  // ✅ Live validation
  [firstName, lastName, emailPhone, password, confirmPassword].forEach(input => {
    input.addEventListener("input", () => liveValidate(input));
  });

  // ✅ On form submit
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let hasError = false;

    // Reset error messages
    const errorMessages = signupForm.querySelectorAll(".error-message");
    errorMessages.forEach(e => e.classList.remove("active"));

    // Validation checks
    if (firstName.value.trim() === "") {
      firstName.classList.add("error");
      firstName.nextElementSibling.classList.add("active");
      hasError = true;
    }

    if (lastName.value.trim() === "") {
      lastName.classList.add("error");
      lastName.nextElementSibling.classList.add("active");
      hasError = true;
    }

    if (!validateEmailPhone(emailPhone.value.trim())) {
      emailPhone.classList.add("error");
      emailPhone.nextElementSibling.classList.add("active");
      hasError = true;
    }

    if (password.value.length < 8) {
      password.classList.add("error");
      password.nextElementSibling.classList.add("active");
      hasError = true;
    }

    if (confirmPassword.value !== password.value || confirmPassword.value.length < 8) {
      confirmPassword.classList.add("error");
      confirmPassword.nextElementSibling.textContent = "Passwords do not match";
      confirmPassword.nextElementSibling.classList.add("active");
      hasError = true;
    }

    // Stop if any validation failed
    if (hasError) return;

    // ✅ Prepare data for MockAPI
    const userData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      emailOrPhone: emailPhone.value.trim(),
      password: password.value.trim(),
      createdAt: new Date().toISOString(),
    };

    // ✅ Send to MockAPI
    try {
      const response = await fetch("https://68ca9796430c4476c34a1c61.mockapi.io/api/fixitapp/new-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error("Failed to register user");

      // 🎉 Success
      alert("Successfully registered 🎉");
      signupForm.reset();

      // Redirect to overlay page
      window.location.href = "success-overlay-page.html";
    } catch (error) {
      console.error("❌ Error registering user:", error);
      alert("❌ Something went wrong while creating your account. Please try again.");
    }
  });
});

// --------------------
// BACK TO LOGIN BUTTON
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backToLoginBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "login.html";
    });
  }
});

// --------------------
// DARK MODE TOGGLE (Persistent Across Pages)
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("cb1");
  const body = document.body;
  const dayIcon = document.getElementById("dayIcon");
  const nightIcon = document.getElementById("nightIcon");

  if (!toggle || !dayIcon || !nightIcon) return;

  // 🧠 Load the saved theme
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

  // 🌓 Save and switch themes
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.remove("day-background");
      body.classList.add("night-background");
      dayIcon.style.display = "none";
      nightIcon.style.display = "inline-block";
      localStorage.setItem("themeMode", "night");
    } else {
      body.classList.remove("night-background");
      body.classList.add("day-background");
      nightIcon.style.display = "none";
      dayIcon.style.display = "inline-block";
      localStorage.setItem("themeMode", "day");
    }
  });
});
