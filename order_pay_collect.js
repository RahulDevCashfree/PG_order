const axios = require("axios");
const fs = require("fs");

// Dynamic Environment Configuration
const environment = "Test"; // Change to 'Prod' for production

const config = {
  Test: {
    baseURL: "https://sandbox.cashfree.com/pg/orders/sessions",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "x-api-version": "2023-08-01"
    }
  },
  Prod: {
    baseURL: "https://api.cashfree.com/pg/orders/sessions",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "x-api-version": "2023-08-01"
    }
  }
};

// Function to Read JSON Data for payment_session_id
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error.message);
    return null;
  }
};

// Function to Perform the API Call
const createUPICollectRequest = async () => {
  // Fetch payment_session_id
  const sessionData = readJsonFile("payment_session_data.json");
  if (!sessionData || !sessionData.payment_session_id) {
    console.error("Error: payment_session_id not found in the JSON file.");
    return;
  }

  // Dynamic Payload
  const payload = {
    payment_method: {
      upi: {
        channel: "collect",
        upi_id: "@gocash" // Change for actual UPI ID in Prod
      }
    },
    payment_session_id: sessionData.payment_session_id
  };

  try {
    // Select Environment
    const envConfig = environment === "Test" ? config.Test : config.Prod;

    // API Request
    const response = await axios.post(envConfig.baseURL, payload, {
      headers: envConfig.headers
    });

    console.log("Response:", response.data);
  } catch (error) {
    console.error(
      "Error during API call:",
      error.response?.data || error.message
    );
  }
};

// Trigger the Function
createUPICollectRequest();
