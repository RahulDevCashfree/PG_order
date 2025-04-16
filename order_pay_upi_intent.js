const axios = require("axios");
const fs = require("fs");

// Environment Configuration (Set 'Test' or 'Prod')
const environment = "Prod"; // Change this to 'Prod' for production environment

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
const performPayment = async () => {
  // Fetch payment_session_id from JSON file
  const sessionData = readJsonFile("payment_session_data.json");
  if (!sessionData || !sessionData.payment_session_id) {
    console.error("Payment session ID not found in payment_session_data.json");
    return;
  }

  const paymentSessionId = sessionData.payment_session_id;

  // Define the Base URL based on the environment (Test or Production)
  const baseUrl =
    environment === "Test"
      ? "https://sandbox.cashfree.com/pg/orders/sessions"
      : "https://api.cashfree.com/pg/orders/sessions";

  // Payload for the Payment
  const payload = {
    payment_method: {
      upi: {
        channel: "link", // UPI channel for the payment
      },
    },
    payment_session_id: paymentSessionId,
  };

  try {
    // API Call to Perform Payment
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

// Call the Function
performPayment();
