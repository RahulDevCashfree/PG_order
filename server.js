const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Environment Configuration (Set 'Test' or 'Prod')
const environment = "Test"; // Use 'Test' or 'Prod'

// Load Credentials from api_keys.json
const loadConfig = () => {
  try {
    const data = fs.readFileSync("api_keys.json", "utf8");
    const config = JSON.parse(data);

    if (!config[environment]) {
      throw new Error(`No configuration found for environment: ${environment}`);
    }

    return {
      XClientId: config[environment].client_id,
      XClientSecret: config[environment].client_secret,
    };
  } catch (error) {
    console.error("Error loading API keys:", error.message);
    process.exit(1);
  }
};

// Fetch Cashfree Credentials
const Cashfree = loadConfig();

// Base URL for Cashfree API
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

// Function to Fetch Order Details
const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`${baseURL}/${orderId}`, {
      headers: {
        accept: "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": Cashfree.XClientId,
        "x-client-secret": Cashfree.XClientSecret,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error.response?.data || error.message);
    return null;
  }
};

// Function to Poll Order Status (Cron-like Job)
const pollOrderStatus = async (orderId, res) => {
  let attempts = 0;
  const maxAttempts = 10; // Polling limit
  const pollingInterval = 5000; // 5 seconds interval

  const checkStatus = async () => {
    attempts++;
    console.log(`Checking status for order: ${orderId} (Attempt: ${attempts})`);

    const orderDetails = await fetchOrderDetails(orderId);

    if (orderDetails) {
      const status = orderDetails.order_status;

      if (status === "PAID") {
        return res.send(`
          <h1>Payment Successful ✅</h1>
          <p>Your order <strong>${orderId}</strong> has been successfully processed.</p>
        `);
      } else if (status === "FAILED" || attempts >= maxAttempts) {
        return res.send(`
          <h1>Payment Failed ❌</h1>
          <p>Your order <strong>${orderId}</strong> was not successful. Please try again.</p>
        `);
      }
    }

    // Retry if status is still pending
    if (attempts < maxAttempts) {
      setTimeout(checkStatus, pollingInterval);
    } else {
      res.send(`
        <h1>Payment Status Unknown ⚠️</h1>
        <p>Your order <strong>${orderId}</strong> is still processing. Please check later.</p>
      `);
    }
  };

  checkStatus();
};

// Handle Return URL and Start Polling
app.get("/return", async (req, res) => {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).send("Invalid Request: Missing order_id.");
  }

  console.log("Processing order_id:", order_id);

  // Start polling order status
  pollOrderStatus(order_id, res);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
