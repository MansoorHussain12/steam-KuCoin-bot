const reverseStr = (str) => {
  let totalLength = str.length;

  let split = str.split("").reverse().join("");
  let point = split.indexOf(".");

  split = split.slice(point - 8, totalLength);
  split = split.split("").reverse().join("");

  return parseFloat(split);
};

const getRandomInt = (amount) => {
  let regEx = /^\d*\.?\d*$/;
  let amountLength = amount.length;
  let decimalPoint = amount.indexOf(".");
  let afterDecimal = amountLength - (decimalPoint + 1);
  let maximum = "";

  if (amountLength > 15 || !amount.match(regEx)) {
    return "Please enter a valid amount";
  }

  if (afterDecimal > 6) {
    return "Please enter amount in less than 6 digits after decimal point. \n For example: \n1.12345 is Valid. \n1.123456 is invalid";
  }

  // For precision >== 6

  if (decimalPoint >= 0) {
    if (amount.charAt(decimalPoint + 1) === "0") maximum = amount + "0000999";
    else if (amount.charAt(decimalPoint + 1) === "")
      maximum = amount + "00000999";
    else {
      switch (afterDecimal) {
        case 5:
          maximum = amount + "999";
          break;
        case 4:
          maximum = amount + "0999";
          break;
        case 3:
          maximum = amount + "0999";
          break;

        case 2:
          maximum = amount + "000999";
          break;
        case 1:
          maximum = amount + "00000999";
          break;

        case 0:
          switch (afterDecimal) {
            case 5:
              maximum = amount + "999";
              break;
            case 4:
              maximum = amount + "0999";
              break;
            case 3:
              maximum = amount + "0999";
              break;

            case 2:
              maximum = amount + "000999";
              break;

            case 1:
              maximum = amount + "00000999";
              break;
          }
      }
    }
  } else {
    maximum = amount + ".00000999";
  }

  let min = parseFloat(amount);
  let max = parseFloat(maximum);

  let result = Math.random() * (max - min) + min;
  let inString = result.toString();
  let inNumber = reverseStr(inString);

  return inNumber;
};

exports.getAmount = getRandomInt;
