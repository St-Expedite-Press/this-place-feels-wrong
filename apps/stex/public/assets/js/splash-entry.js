import { mountSplashSignup } from "./splash-signup.js";

mountSplashSignup({
  form: document.getElementById("splash-signup"),
  emailInput: document.getElementById("splash-email"),
  submitButton: document.getElementById("splash-submit"),
  helper: document.getElementById("splash-helper"),
  source: "splash",
});
