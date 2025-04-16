const axios = require("axios");
const fs = require("fs");

// Environment Configuration (Set 'Test' or 'Prod')
const environment = "Test"; // Change to "Prod" for production

// Load API keys from api_keys.json
const loadApiKeys = () => {
  const data = fs.readFileSync("api_keys.json", "utf8");
  const parsed = JSON.parse(data);

  if (!parsed[environment]) {
    throw new Error(`Missing credentials for environment: ${environment}`);
  }

  return {
    clientId: parsed[environment].client_id,
    clientSecret: parsed[environment].client_secret,
  };
};

// Base URL Based on Environment
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

// Function to Fetch Order Payments and Save Payment Data
const fetchOrderPayments = async (orderId, credentials) => {
  try {
    const response = await axios.get(`${baseURL}/${orderId}/payments`, {
      headers: {
        accept: "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": credentials.clientId,
        "x-client-secret": credentials.clientSecret,
      },
    });

    console.log("✅ Order Payments Fetched Successfully:", response.data);

    const payment = response.data?.[0]; // assuming first payment is sufficient

    if (!payment) {
      console.warn("⚠️ No payment details found for this order.");
      return;
    }

    const paymentData = {
      cf_payment_id: payment.cf_payment_id,
      order_id: payment.order_id,
      payment_amount: payment.payment_amount,
      payment_status: payment.payment_status,
      payment_time: payment.payment_time,
      bank_reference: payment.bank_reference,
    };

    fs.writeFileSync(
      "payment_data.json",
      JSON.stringify(paymentData, null, 2),
      "utf8"
    );

    console.log("✅ payment_data.json written successfully.");
  } catch (error) {
    console.error(
      "❌ Error Fetching Order Payments:",
      error.response?.data || error.message
    );
  }
};

// Main Function: Read order_id and fetch payment details
const fetchDetails = () => {
  const credentials = loadApiKeys();

  fs.readFile("order_data.json", "utf8", (err, orderData) => {
    if (err) {
      console.error("❌ Error reading order_data.json:", err);
      return;
    }

    try {
      const orderJson = JSON.parse(orderData);
      const orderId = orderJson.order_id;

      if (!orderId) throw new Error("No order_id found in order_data.json");

      fetchOrderPayments(orderId, credentials);
    } catch (parseErr) {
      console.error("❌ Error parsing order_data.json:", parseErr);
    }
  });
};

fetchDetails();
