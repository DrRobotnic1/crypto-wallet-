"use strict";

const formContainer = document.querySelector(".form-container");
const deposit = document.querySelector(".deposit-btn");
const sell_btn = document.querySelector(".sell-btn");
const close_form = document.querySelector(".close-icon ");
const close_form_buy = document.querySelector(".close-icon-buy");
const close_form_sell = document.querySelector(".close-icon-sell");
const close_form_widraw = document.querySelector(".close-icon-widraw");
const table = document.querySelector(".transaction-table");
const buy_btn = document.querySelector(".buy-btn");
const widraw_btn = document.querySelector(".withdraw-btn");
const formContainer_buy = document.querySelector(".form-container-buy");
const formContainer_sell = document.querySelector(".form-container-sell");
const formContainer_widraw = document.querySelector(
  ".form-container-withdraw "
);
const priceElement = document.querySelector(".price");
const zar_balance_label = document.getElementById("zar_balance");
const btc_balance_label = document.querySelector(".balance-btc");
const convert_zar = document.querySelector(".convert-zar");

deposit.addEventListener("click", function () {
  formContainer.classList.remove("hidden");
});

close_form.addEventListener("click", () => {
  formContainer.classList.add("hidden");
});

buy_btn.addEventListener("click", function () {
  formContainer_buy.classList.remove("hidden");
});

close_form_buy.addEventListener("click", () => {
  formContainer_buy.classList.add("hidden");
});

sell_btn.addEventListener("click", function () {
  formContainer_sell.classList.remove("hidden");
});

close_form_sell.addEventListener("click", () => {
  formContainer_sell.classList.add("hidden");
});

widraw_btn.addEventListener("click", () => {
  formContainer_widraw.classList.remove("hidden");
});

close_form_widraw.addEventListener("click", () => {
  formContainer_widraw.classList.add("hidden");
});

// // transactions
async function getData() {
  //current user

  const url = "http://localhost:3000/transactions";

  let response = await fetch(url);

  let data = await response.json();
  console.log(data);

  for (var el in data) {
    console.log(el);
    const html = `<tr>
    <td>${data[el].transaction_id}</td>
    <td>${data[el].date}</td>
    <td>${data[el].type}</td>
    <td>R ${data[el].amount}</td>
    </tr>`;
    table.innerHTML += html;
  }

  //balance

  const btc_current_market_price = await fetchBtcToZarRate();

  const bal_res = await fetch("http://localhost:3000/balance");
  const balance_data = await bal_res.json();

  const zar_balance = balance_data[0].zar_balance;

  zar_balance_label.textContent = `R ${zar_balance}`;

  const btc_balance = balance_data[0].btc_balance;
  btc_balance_label.textContent = `BTC ${(
    btc_balance / btc_current_market_price
  ).toFixed(5)}`;

  convert_zar.textContent = `R ${(
    (((btc_balance / btc_current_market_price) * btc_current_market_price) /
      100) *
    100
  ).toFixed(2)}`;

  console.log(btc_current_market_price);
}

getData();

let previousRate = null;
async function fetchBtcToZarRate() {
  const btc_url = "https://api.coinbase.com/v2/exchange-rates?currency=BTC";

  try {
    const response = await fetch(btc_url);
    const data = await response.json();
    const currentRate = parseFloat(data.data.rates.ZAR);

    if (previousRate !== null) {
      if (currentRate > previousRate) {
        priceElement.classList.remove("decrease");
        priceElement.classList.add("increase");
      } else if (currentRate < previousRate) {
        priceElement.classList.remove("increase");
        priceElement.classList.add("decrease");
      }
    }

    previousRate = currentRate;

    priceElement.textContent = `1 BTC = ${currentRate.toFixed(2)} ZAR`;
    return currentRate;
  } catch (error) {
    priceElement.textContent = "Error fetching data";
    console.error("Error fetching BTC to ZAR rate:", error);
  }
}

fetchBtcToZarRate();

setInterval(fetchBtcToZarRate, 60);
