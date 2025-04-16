const axios = require("axios");
const fs = require("fs");

// Environment Configuration (Set 'Test' or 'Prod')
const environment = "Prod"; // Use 'Test' or 'Prod'

// Card Details Mapping for Test Environment (only one card number needed)
const testCard = {
  "4706131211212123": "Visa Debit", // Test Card 1
  "4576238912771450": "Visa Credit Retail", // Test Card 2
  "5409162669381034": "Mastercard Debit", // Test Card 3
  "6074825972083818": "Rupay Debit", // Test Card 4
};

// Base URL Configuration Based on Environment
const baseUrl =
  environment === "Test"
    ? "https://sandbox.cashfree.com/pg/orders/sessions"
    : "https://api.cashfree.com/pg/orders/sessions";

// Function to Read JSON Data
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
};

// Function to Perform Payment Using Session
const performPayment = async (cardNumber) => {
  // Fetch payment_session_id
  const sessionData = readJsonFile("payment_session_data.json");
  if (!sessionData || !sessionData.payment_session_id) {
    console.error("Payment session ID not found in payment_session_data.json");
    return;
  }

  let cardNumberToUse;

  // Validate Card Number Based on Environment
  if (environment === "Test") {
    if (!testCard[cardNumber]) {
      console.error(
        `Invalid card number for the Test environment. Choose from: ${Object.keys(
          testCard
        ).join(", ")}`
      );
      return;
    }
    cardNumberToUse = cardNumber; // Use test card number
    console.log(`Using Test Card: ${testCard[cardNumber]} (${cardNumber})`);
  } else {
    // For Production, use the manually provided card number
    if (!cardNumber || cardNumber.length < 12) {
      console.error("Invalid card number for Production.");
      return;
    }
    cardNumberToUse = cardNumber;
    console.log(`Using Production Card Number: ${cardNumber}`);
  }

  // Payload for the Payment
  const payload = {
    payment_method: {
      card: {
        channel: "post",
        card_number: "4315813502830001",
        card_holder_name: "Rahul Raman",
        card_expiry_mm: "09",
        card_expiry_yy: "29",
        card_cvv: "214",
      },
    },
    payment_session_id: sessionData.payment_session_id,
  };

  console.log(payload);

  try {
    // API Call to Perform Payment
    console.log("Initiating Payment Request...");
    const response = await axios.post(baseUrl, payload, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
      },
    });

    console.log("Payment Successful:", response.data);
  } catch (error) {
    console.error(
      "Error in Payment:",
      error.response?.data || error.message
    );
  }
};

// Example Function Call
// Pass a valid card number (Test environment: from testCard; Prod: manually entered)
performPayment("4706131211212123"); // Example for Test: Visa Debit Card
// For Production: performPayment("4111111111111111"); // Replace with a valid Production card number
