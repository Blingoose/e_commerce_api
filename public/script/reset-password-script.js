import axios from "./axios";

const form = document.querySelector("#reset-password-form");
const submitButton = document.querySelector(".submit");
const message = document.querySelector(".message");
const password = document.querySelector("#password");
const repeatPassword = document.querySelector("#repeat-password");
let timeoutId;

function checkValidity() {
  if (
    password.value.trim().length > 0 &&
    repeatPassword.value.trim().length > 0
  ) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
}

function statusMessage() {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    message.innerText = "";
  }, 3000);
}

password.addEventListener("input", checkValidity);
repeatPassword.addEventListener("input", checkValidity);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusMessage();

  if (password.value !== repeatPassword.value) {
    message.innerText = "Passwords do not match!";
    password.value = "";
    repeatPassword.value = "";
    // statusMessage();
    checkValidity();
    return;
  } else {
    clearTimeout(timeoutId);
    message.innerText = "Loading....";
  }

  if (form.dataset.submitting === "true") {
    // if form is already being submitted, do nothing
    return;
  }

  form.dataset.submitting = "true"; // set submitting flag

  // gat email and token from the url params
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  const token = urlParams.get("token");
  const data = { email, password: password.value, token };

  const dynamicURL = `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? ":" + window.location.port : ""
  }/api/v1/auth/reset-password`;

  try {
    const response = await axios.post(dynamicURL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = response.data;
    message.innerText = Object.values(result);
    password.value = "";
    repeatPassword.value = "";
    checkValidity();
  } catch (error) {
    message.innerText = "An error occurred. Please try again later.";
  } finally {
    form.dataset.submitting = "false"; // unset submitting flag
    statusMessage();
  }
});
