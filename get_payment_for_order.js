const axios = require("axios");
const fs = require("fs");

// Set environment: "Test" or "Prod"
const environment = "Test";

// Load API keys dynamically from api_keys.json
let apiKeys;
try {
  const rawKeys = fs.readFileSync("api_keys.json", "utf8");
  apiKeys = JSON.parse(rawKeys)[environment];

  if (!apiKeys || !apiKeys.client_id || !apiKeys.client_secret) {
    throw new Error(`Missing client_id or client_secret for environment: ${environment}`);
  }
} catch (error) {
  console.error("❌ Error loading API keys:", error.message);
  process.exit(1);
}

// Base URL based on environment
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

// Function to fetch payments for an order
const fetchOrderPayments = async (orderId) => {
  const headers = {
    accept: "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": apiKeys.client_id,
    "x-client-secret": apiKeys.client_secret,
  };

  console.log("🧾 Headers:", headers);

  try {
    const response = await axios.get(`${baseURL}/${orderId}/payments`, { headers });

    console.log("✅ Order Payments Fetched:", response.data);

    const paymentDetails = response.data?.[0];
    if (paymentDetails) {
      const paymentData = {
        cf_payment_id: paymentDetails.cf_payment_id,
        order_id: paymentDetails.order_id,
        payment_amount: paymentDetails.payment_amount,
        payment_status: paymentDetails.payment_status,
        payment_time: paymentDetails.payment_time,
        bank_reference: paymentDetails.bank_reference,
      };

      fs.writeFileSync(
        "payment_data.json",
        JSON.stringify(paymentData, null, 2),
        "utf8"
      );
      console.log("✅ Payment data saved to payment_data.json");
    } else {
      console.warn("⚠️ No payment details found.");
    }
  } catch (error) {
    console.error("❌ Error Fetching Order Payments:", error.response?.data || error.message);
  }
};

// Read order_id from order_data.json and trigger payment fetch
fs.readFile("order_data.json", "utf8", (err, data) => {
  if (err) {
    console.error("❌ Error reading order_data.json:", err.message);
    return;
  }

  try {
    const orderJson = JSON.parse(data);
    const orderId = orderJson.order_id;

    if (!orderId) throw new Error("order_id not found in order_data.json");

    fetchOrderPayments(orderId);
  } catch (parseError) {
    console.error("❌ Error parsing order_data.json:", parseError.message);
  }
});
