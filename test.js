const mongoose = require("mongoose");

const API = require("kucoin-node-sdk");
API.init(require("./config/sandbox-kucoin"));
const { checkAmount } = require("./models/transactionRecord");

mongoose
  .connect("mongodb://localhost/steambot")
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((error) => {
    console.error(error);
  });

// let record = [];

// let amount = 0;
// let number = 0;

// while (number != 999) {
//   amount = getAmount("1.0");
//   if (!record.find((a) => a === amount)) {
//     record.push(amount);
//     number++;
//   } else {
//     amount = getAmount("1.0");
//   }
// }

// console.log(record.length);

let details = {
  _id: 76561199355768720,
  crypto: {
    name: "XLM",
    balance: ".1234",
  },
};

const abc = async () => {
  let amount = await checkAmount(details);
  console.log(amount);
};

abc();
