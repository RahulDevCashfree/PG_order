const axios = require("axios");
const fs = require("fs"); // To read JSON file

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

// Function to Update Order Status
const updateOrderStatus = async (orderId) => {
  const url = `${baseURL}/${orderId}`;

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    "x-api-version": "2023-08-01",
    "x-client-id": Cashfree.XClientId,
    "x-client-secret": Cashfree.XClientSecret,
  };

  const data = {
    order_status: "TERMINATED", // Update order status here
  };

  try {
    const response = await axios.patch(url, data, { headers });
    console.log("Order Status Updated Successfully:", response.data);
  } catch (error) {
    console.error(
      "Error Updating Order Status:",
      error.response?.data || error.message
    );
  }
};

// Read order_id dynamically from order_data.json file
fs.readFile("order_data.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading order_data.json file:", err);
    return;
  }

  try {
    const orderData = JSON.parse(data);
    const orderId = orderData.order_id;

    if (!orderId) {
      throw new Error("No order_id found in order_data.json");
    }

    // Call the function to update the order status with the fetched orderId
    updateOrderStatus(orderId);
  } catch (parseError) {
    console.error("Error parsing order_data.json:", parseError.message);
  }
});
