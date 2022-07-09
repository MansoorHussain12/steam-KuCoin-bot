const mongoose = require("mongoose");
const SteamUser = require("steam-user");
var client = new SteamUser();

const { validateCurrency, getDepositAddress } = require("./kucoin-api");
const { saveBalance, checkBalance } = require("./models/balance");
const { saveTxRecord, checkTxRecord } = require("./models/transactionRecord");
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

const commands =
  "To deposit crypto  =>  !deposit [Amount] [Currency]\n\n To check your balance  =>  !balance\n";
let crypto = { name: "", balance: 0 };
let depositCount = 0;

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

  //If friends asks to show list of commands

  if (message.match(commandList)) {
    client.chat.sendFriendMessage(steamID, commands);
  }

  // If friend gives balance command
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

  // If friend gives the deposit command
  else if (message.match(depositCommand)) {
    const words = message.split(" ");

    const details = {
      _id: _id,
      crypto: {
        name: words[2],
        balance: words[1],
      },
    };

    try {
      const currencyDetails = await validateCurrency(details.crypto.name);

      if (currencyDetails.data) {
        let checkedAmount = getAmount(details.crypto.balance);

        if (typeof checkedAmount === "string") {
          client.chat.sendFriendMessage(steamID, checkAmount);
          return;
        }

        const depositAddress = await getDepositAddress(details.crypto.name);
        details.crypto.balance = checkedAmount;

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
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
        }, 1000);

        await saveBalance(details);
        await saveTxRecord(details);

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            `Please deposit the exact amount ${details.crypto.balance} , or you will have to confirm the transaction manually with us.`
          );
        }, 2000);

        setTimeout(() => {
          client.chat.sendFriendMessage(
            steamID,
            "To check your balance type '!balance'."
          );
        }, 3000);
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
