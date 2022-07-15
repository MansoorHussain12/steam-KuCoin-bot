const mongoose = require("mongoose");
const SteamUser = require("steam-user");
var client = new SteamUser();

const { validateCurrency, getDepositAddress } = require("./kucoin-api");
const { checkBalance } = require("./models/balance");
const { depositList } = require("./models/deposit");
const { toSteam64 } = require("./helpers/steamId");
const {
  getTxId,
  saveTxRecord,
  checkAmount,
  transactionLimit,
} = require("./models/transactionRecord");

mongoose
  .connect("mongodb://localhost/steambot")
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((error) => {
    console.error(error);
  });

const depositCommand = /!deposit\s([1-9]+\.?[0-9]*|[0-9]+)\s[a-z]+(\s[a-z])?/gi;
const commandList = /!commands/gi;
const balanceCommand = /!balance/g;

const commands =
  "To deposit crypto  =>  !deposit [Amount] [Currency]\n\n To check your balance  =>  !balance\n";

client.logOn({
  accountName: "lashkari07",
  password: "Warkillshope0007.",
});

client.on("loggedOn", async function (details) {
  console.log("Logged into Steam as " + client.steamID.getSteam3RenderedID());
  client.setPersona(SteamUser.EPersonaState.Online);
});

client.on("error", function (e) {
  // Some error occurred during logon
  console.log(e);
});

client.on("emailInfo", function (address, validated) {
  console.log(
    "Our email address is " +
      address +
      " and it's " +
      (validated ? "validated" : "not validated")
  );
});

client.on("friendRelationship", function (steamID, relationship) {
  if (relationship == SteamUser.EFriendRelationship.RequestRecipient) {
    console.log("We recieved a friend request from " + steamID);
    client.addFriend(steamID, function (err, name) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Accepted friend request of user " + name);
    });
  }
});

try {
  setInterval(async () => {
    let result = await depositList();
    // console.log(result.status);
    if (result.status === true) {
      client.chat.sendFriendMessage(
        result._id,
        "***** Your transaction has been confirmed on blockchain. *****"
      );
    }
  }, 3300);
} catch (error) {
  console.log(error);
}

client.on("friendMessage", async function (steamID, message) {
  console.log("Friend message from " + steamID + ": " + message);
  const _id = toSteam64(steamID);

  //If friends asks to show list of commands by !commands

  if (message.match(commandList)) {
    client.chat.sendFriendMessage(steamID, commands);
  }

  // If friend asks his balance by !balance command
  else if (message.match(balanceCommand)) {
    try {
      let result = [];
      const response = await checkBalance(_id);
      if (typeof response === "string") {
        client.chat.sendFriendMessage(steamID, response);
      } else {
        response.forEach((c) => result.push(c.name + " : " + c.balance));
        result = result.join("\n\n");
        client.chat.sendFriendMessage(steamID, result);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // If friend asks to deposit crypto !deposit command
  else if (message.match(depositCommand)) {
    const words = message.split(" ");

    let details = {
      _id: toSteam64(steamID),
      crypto: {
        name: words[2],
        balance: words[1],
        chain: words[3],
      },
    };

    try {
      const currencyDetails = await validateCurrency(details.crypto.name);

      if (currencyDetails.data) {
        let limit = await transactionLimit(details);
        if (limit === 0) {
          client.chat.sendFriendMessage(
            steamID,
            `You have reached the limit of 3 transactions on "${details.crypto.name}". Future transaction will be enabled after the confirmation of your previous transactions.`
          );
          return;
        }

        let amount = await checkAmount(details);

        if (typeof amount === "string") {
          client.chat.sendFriendMessage(steamID, amount);
          return;
        }

        client.chat.sendFriendMessage(
          steamID,
          `You have ${
            limit - 1
          } number of transactions available after this for "${
            details.crypto.name
          }". Fetching you details please wait...`
        );

        details.crypto.balance = amount;
        let depositAddress = "";

        if (words.length === 3)
          depositAddress = await getDepositAddress(details.crypto.name);

        if (words.length === 4)
          depositAddress = await getDepositAddress(
            details.crypto.name,
            details.crypto.chain
          );

        await saveTxRecord(details);
        console.log(details);
        let txId = await getTxId(
          details._id,
          details.crypto.name,
          details.crypto.balance
        );

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            "Details : *** \n" +
              "Currency : " +
              details.crypto.name +
              "\n" +
              "Amount: " +
              details.crypto.balance +
              "\n" +
              "Address : " +
              depositAddress.data[0].address +
              "\n" +
              "Memo : " +
              depositAddress.data[0].memo
          );
        }, 3000);

        setTimeout(() => {
          client.chat.sendFriendMessage(steamID, "TxID : " + txId + "\n ***");
        }, 10000);

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            `Please deposit the exact amount ${details.crypto.balance} , or you will have to confirm the transaction manually with us.`
          );
        }, 3500);

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            "To check your balance type '!balance'."
          );
        }, 5000);

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            `You transaction is being processed. You will be informed here once your transaction is confirmed on blockchain.`
          );
        }, 10000);
      } else {
        client.chat.sendFriendMessage(
          steamID,
          "The currency you entered does not support deposit with us!"
        );
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    client.chat.sendFriendMessage(
      steamID,
      "Peace be upon you! Type '!commands' to see list of commands."
    );
  }
});
