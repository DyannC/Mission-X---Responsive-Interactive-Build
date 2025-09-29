// Select form and inputs
const form = document.querySelector(".contact-form");
const nameInput = form.querySelector('input[placeholder="Name"]');
const contactInput = form.querySelector('input[placeholder="Email or Phone"]');

// Helper functions for validation
function validateEmail(email) {
  const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  return pattern.test(email);
}

function validatePhone(phone) {
  const pattern = /^[0-9]{7,15}$/; // 7-15 digits
  return pattern.test(phone);
}

function validateContact(value) {
  return validateEmail(value) || validatePhone(value);
}

// Live validation function for green border
function liveValidate(input) {
  if (input.value.trim() === "") {
    input.classList.remove("valid"); // no green border
  } else {
    if (input === nameInput) {
      input.classList.add("valid"); // name is valid if not empty
    } else if (input === contactInput) {
      if (validateContact(input.value)) {
        input.classList.add("valid"); // green border for valid email/phone
      } else {
        input.classList.remove("valid"); // remove green if invalid
      }
    }
  }
}

// Event listeners for live green border
nameInput.addEventListener("input", () => liveValidate(nameInput));
contactInput.addEventListener("input", () => liveValidate(contactInput));

// Submit button validation
form.addEventListener("submit", (event) => {
  event.preventDefault();
  let hasError = false;

  // Name validation
  const nameError = nameInput.nextElementSibling;
  nameError.classList.remove("active");
  nameInput.classList.remove("error");

  if (nameInput.value.trim() === "") {
    nameInput.classList.add("error"); // red border
    nameError.textContent = "Please enter your name here";
    nameError.classList.add("active");
    hasError = true;
  }

  // Contact field validation
  const contactError = contactInput.nextElementSibling;
  contactError.classList.remove("active");
  contactInput.classList.remove("error");

  if (contactInput.value.trim() === "" || !validateContact(contactInput.value)) {
    contactInput.classList.add("error"); // red border
    contactError.textContent = contactInput.value.trim() === "" ?
      "Please enter a valid email address or phone" :
      "Enter a valid email or phone number";
    contactError.classList.add("active");
    hasError = true;
  }

  // If all fields are valid, redirect to confirmation page
  if (!hasError) {
    window.location.href = "confirmation-page.html";
  }
});

// Skip button functionality
const skipBtn = document.querySelector(".skip-btn");
skipBtn.addEventListener("click", () => {
  window.location.href = "confirmation-page.html";
});
