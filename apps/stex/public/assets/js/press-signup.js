import { mountSplashSignup } from "./splash-signup.js";

mountSplashSignup({
  form: document.getElementById("press-signup"),
  emailInput: document.getElementById("press-email"),
  submitButton: document.getElementById("press-submit"),
  helper: document.getElementById("press-helper"),
  source: "press",
});
