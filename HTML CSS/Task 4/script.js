const form = document.getElementById("contact-form");

// Load saved draft from localStorage
window.addEventListener("load", () => {
  const savedData = JSON.parse(localStorage.getItem("contactFormDraft") || "{}");
  for (const [key, value] of Object.entries(savedData)) {
    const field = form.elements[key];
    if (field) field.value = value;
  }
});

// Save to localStorage on input
form.addEventListener("input", () => {
  const formData = {};
  for (const el of form.elements) {
    if (el.name) {
      formData[el.name] = el.value;
    }
  }
  localStorage.setItem("contactFormDraft", JSON.stringify(formData));
});

// Remove saved data when form is reset
form.addEventListener("reset", () => {
  localStorage.removeItem("contactFormDraft");
});

// On submit, validate and optionally clear storage
// form.addEventListener("submit", (e) => {
//   if (!form.checkValidity()) {
//     alert("Please fill all required fields correctly.");
//     e.preventDefault();
//   } else {
//     alert("Form submitted!");
//     localStorage.removeItem("contactFormDraft");
//   }
// });

form.addEventListener("submit", (e) => {
  form.classList.add("submitted");

  if (!form.checkValidity()) {
    alert("Please fill all required fields correctly.");
    e.preventDefault(); // prevent real submission
  } else {
    alert("Form submitted!");
    localStorage.removeItem("contactFormDraft");
  }
});
