const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Load API Keys and Configurations from JSON
const loadConfig = (filename) => {
  try {
    const filePath = path.join(__dirname, filename);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error.message);
    process.exit(1);
  }
};

// Environment Configuration (Set 'Test' or 'Prod')
const environment = "Test"; // Change to "Prod" for production
const config = loadConfig("api_keys.json")[environment];

// Base URL Based on Environment
const apiUrl =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

// Function to calculate order expiry time (7 days from now)
const getExpiryTime = () => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // Add 7 days
  return expiryDate.toISOString(); // Convert to ISO 8601 format
};

// Parameters for Creating an Order
const cashFreeParams = {
  customer_details: {
    customer_id: "7112AAA812234",
    customer_phone: "8971520311",
    customer_email: "test@cashfree.com",
  },
  order_meta: {
    return_url: "http://localhost:3000/return?order_id={order_id}",
    notify_url: "https://webhook.site/0718efe8-71d2-43b6-b2a5-7ff2f706ff32",
    payment_methods: "",
  },
  order_id: `order_${Date.now()}`, // Unique order ID based on timestamp
  order_amount: 200, // Order amount
  order_currency: "INR", // Currency
  order_expiry_time: getExpiryTime(), // Set expiry 7 days from now
  order_note: "Test order", // Note for the order
};

// Function to Create an Order
const createOrder = async () => {
  try {
    const response = await axios.post(apiUrl, cashFreeParams, {
      headers: {
        "X-Client-Id": config.client_id,
        "X-Client-Secret": config.client_secret,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
    });

    console.log("Order Created Successfully:", response.data);

    const { payment_session_id, order_id } = response.data;

    // Save payment_session_id in payment_session_data.json
    const paymentSessionData = {
      payment_session_id,
      created_at: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    };
    fs.writeFileSync(
      "payment_session_data.json",
      JSON.stringify(paymentSessionData, null, 2)
    );
    console.log("Payment Session ID saved in payment_session_data.json");
    

    // Save order_id in order_data.json
    const orderData = {
      order_id,
      created_at: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    };
    fs.writeFileSync(
      "order_data.json",
      JSON.stringify(orderData, null, 2)
    );
    console.log("Order ID saved in order_data.json");

  } catch (error) {
    console.error(
      "Error Creating Order:",
      error.response?.data?.message || error.message
    );
  }
};

// API to serve the payment session ID
app.get("/get-session-id", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("payment_session_data.json", "utf8"));
    res.json({ payment_session_id: data.payment_session_id });
  } catch (error) {
    res.status(500).json({ error: "No session ID found. Please create an order first." });
  }
});

// API to serve the order ID
app.get("/get-order-id", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync("order_data.json", "utf8"));
    res.json({ order_id: data.order_id });
  } catch (error) {
    res.status(500).json({ error: "No order ID found. Please create an order first." });
  }
});

// Serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Create an Order on Server Start (Optional)
createOrder();

// Exit the script after 20 seconds (for demonstration only)
setTimeout(() => {
  console.log("Exiting script...");
  process.exit(0); // Ensures script exits
}, 20000);


  

//   "client_id": "TEST10017400ffdc79d4ec2ae84549aa00471001",
//   "client_secret": "TEST792106b1d29fe9434857ba6062af47c6a2ff07ec"
// 
