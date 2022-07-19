// const mongoose = require("mongoose");
// const API = require("kucoin-node-sdk");
// API.init(require("./config/kucoin-config"));

// const { TransactionRecord } = require("./models/transactionRecord");

// mongoose
//   .connect("mongodb://localhost/steambot")
//   .then(() => {
//     console.log("Connected to MongoDB...");
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// const getAddress = async () => {
//   let allTransactions = await TransactionRecord.find();

//   if (!allTransactions) return false;

//   let allAmounts = [];
//   let details = {
//     _id: "",
//     crypto: {
//       name: "",
//       balance: [],
//     },
//   };

//   let i = 0;
//   let j = 0;

//   while (i < allTransactions.length) {
//     while (j < allTransactions[i].currencies.length) {
//       details = {
//         _id: allTransactions[i]._id,
//         crypto: {
//           name: allTransactions[i].currencies[j].name,
//           balance: allTransactions[i].currencies[j].balance,
//         },
//       };
//       allAmounts.push(details);
//       j++;
//     }
//     i++;
//   }

//   let showAddress = await API.rest.User.Deposit.getDepositList();
//   i = 0;
//   j = 0;

//   let amounts = [];

//   console.log(showAddress.data.items);

//   showAddress.data.items.forEach((item) => {
//     // while (i < allAmounts.length) {
//     //   while (j < allAmounts[i].crypto.balance.length) {
//     //     if (item.amount == allAmounts[i].crypto.balance[j].amount) {
//     //       amounts.push(item.amount);
//     //     }
//     //     j++;
//     //   }
//     //   i++;
//     // }
//     for (i = 0; i < allAmounts.length; i++) {
//       for (j = 0; j < allAmounts[i].crypto.balance.length; j++) {
//         if (item.amount == allAmounts[i].crypto.balance[j].amount) {
//           amounts.push(item.amount);
//         }
//       }
//     }
//   });

//   // showAddress.data.items.forEach((item) => {
//   //   amounts.push(item.amount);
//   // });

//   console.log(amounts);
// };

// getAddress();
