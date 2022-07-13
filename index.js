const mongoose = require("mongoose");
const SteamUser = require("steam-user");
var client = new SteamUser();

const { validateCurrency, getDepositAddress } = require("./kucoin-api");
const { saveBalance, checkBalance } = require("./models/balance");
const { informUser } = require("./models/deposit");
const {
  saveTxRecord,
  checkAmount,
  transactionLimit,
} = require("./models/transactionRecord");
const { toSteam64 } = require("./helpers/steamId");
const { getAmount } = require("./helpers/randomAmount");

mongoose
  .connect("mongodb://localhost/steambot")
  .then(() => {
    console.log("Connected to MongoDB...");
  })
  .catch((error) => {
    console.error(error);
  });

const depositCommand = /!deposit\s([1-9]+\.?[0-9]*|[0-9]+)\s[a-z]+/gi;
const commandList = /!commands/gi;
const balanceCommand = /!balance/g;

const depositCount = 0;

const commands =
  "To deposit crypto  =>  !deposit [Amount] [Currency]\n\n To check your balance  =>  !balance\n";

client.logOn({
  accountName: "lashkari07",
  password: "Warkillshope0007.",
});

client.on("loggedOn", function (details) {
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

client.on("friendMessage", async function (steamID, message) {
  console.log("Friend message from " + steamID + ": " + message);
  const _id = parseInt(toSteam64(steamID));

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
      _id: _id,
      crypto: {
        name: words[2],
        balance: words[1],
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

        const depositAddress = await getDepositAddress(details.crypto.name);

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            "Details : ** \n" +
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
              depositAddress.data[0].memo +
              "\n **"
          );
        }, 3000);

        await saveBalance(details);
        await saveTxRecord(details);

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            `Please deposit the exact amount ${details.crypto.balance} , or you will have to confirm the transaction manually with us.`
          );
        }, 3100);

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
