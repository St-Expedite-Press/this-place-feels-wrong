import { mountSplashSignup } from "./splash-signup.js";

// The splash renders two surfaces (desktop portal + mobile stack); only one is
// visible at a time, so mount whichever markup is present.
mountSplashSignup({
  form: document.getElementById("splash-signup"),
  emailInput: document.getElementById("splash-email"),
  submitButton: document.getElementById("splash-submit"),
  helper: document.getElementById("splash-helper"),
  source: "splash",
});

mountSplashSignup({
  form: document.getElementById("splash-signup-mobile"),
  emailInput: document.getElementById("splash-email-mobile"),
  submitButton: document.getElementById("splash-submit-mobile"),
  helper: document.getElementById("splash-helper-mobile"),
  source: "splash",
});
