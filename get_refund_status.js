const axios = require("axios");
const fs = require("fs"); // Required to read files

// Environment Configuration (Set 'Test' or 'Prod')
const environment = "Test"; // Use 'Test' or 'Prod'

// Cashfree Credentials Based on Environment
const Cashfree = {
  XClientId:
    environment === "Test"
      ? "11123595750e973ecc95c94ec5532111" // Test Client ID
      : "145084e43c71b20eab47a2a4b80541", // Production Client ID
  XClientSecret:
    environment === "Test"
      ? "TEST307e06bddd583cc3f86edf02f410fa8a69653d7d" // Test Client Secret
      : "4fd43d83c9728bcd520f6018dea066d68cdc41d", // Production Client Secret
};

// Base URL Based on Environment
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

// Function to Fetch Refund Details
const fetchRefundDetails = async (orderId, refundId) => {
  try {
    const response = await axios.get(
      `${baseURL}/${orderId}/refunds/${refundId}`,
      {
        headers: {
          accept: "application/json",
          "x-api-version": "2023-08-01",
          "x-client-id": Cashfree.XClientId,
          "x-client-secret": Cashfree.XClientSecret,
        },
      }
    );

    console.log("Refund Details Fetched Successfully:", response.data);
  } catch (error) {
    console.error(
      "Error Fetching Refund Details:",
      error.response?.data || error.message
    );
  }
};

// Function to Read Data from JSON Files
const readJsonFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(`Error reading ${filePath}: ${err.message}`);
      } else {
        try {
          resolve(JSON.parse(data));
        } catch (parseError) {
          reject(`Error parsing ${filePath}: ${parseError.message}`);
        }
      }
    });
  });
};

// Read order_id and refund_id from respective files
const fetchRequiredData = async () => {
  try {
    // Read order_id from order_data.json
    const orderData = await readJsonFile("order_data.json");
    const orderId = orderData.order_id;

    // Read refund_id from refund_data.json (assuming it's an array and fetching the last entry)
    const refundData = await readJsonFile("refund_data.json");
    const latestRefund = refundData[refundData.length - 1]; // Get the last refund record
    const refundId = latestRefund.refund_id;

    console.log("Order ID:", orderId);
    console.log("Refund ID:", refundId);

    // Fetch refund details using the retrieved order ID and refund ID
    await fetchRefundDetails(orderId, refundId);
  } catch (error) {
    console.error("Error:", error);
  }
};

// Call the function to execute
fetchRequiredData();
