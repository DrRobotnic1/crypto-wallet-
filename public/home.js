const close_btn = document.querySelector(".close-icon");
const signup_form = document.querySelector(".form-sign-up");
const hero_sign_up = document.querySelector(".hero-signup");
const nav_login_btn = document.querySelector(".login");
const signin_form = document.querySelector(".form-sign-in");
const btc_live_price = document.querySelector(".btc-live-price");
const sign_in_link = document.querySelector(".sign-in-link");
const sign_up_link = document.querySelector(".sign-up-link");

const close_btn_up = document.querySelector(".close-icon-up");

close_btn.addEventListener("click", () => {
  signup_form.classList.add("hidden");
});

hero_sign_up.addEventListener("click", () => {
  signup_form.classList.remove("hidden");
  signin_form.classList.add("hidden");
});

nav_login_btn.addEventListener("click", () => {
  signin_form.classList.remove("hidden");
  signup_form.classList.add("hidden");
});

close_btn_up.addEventListener("click", () => {
  signin_form.classList.add("hidden");
});

sign_in_link.addEventListener("click", () => {
  signin_form.classList.remove("hidden");
  signup_form.classList.add("hidden");
});

sign_up_link.addEventListener("click", () => {
  signup_form.classList.remove("hidden");
  signin_form.classList.add("hidden");
});
