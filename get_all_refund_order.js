const axios = require("axios");
const fs = require("fs"); // To read files
const path = require("path"); // For file path handling

// Function to Load Configuration Dynamically from api_keys.json
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
const environment = "Test"; // Use 'Test' or 'Prod'
const config = loadConfig("api_keys.json")[environment];

// Base URL Based on Environment
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

// Function to Fetch Refund Details
const fetchRefundDetails = async (orderId) => {
  try {
    const response = await axios.get(`${baseURL}/${orderId}/refunds`, {
      headers: {
        accept: "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": config.client_id,
        "x-client-secret": config.client_secret,
      },
    });

    console.log("Refund Details Fetched Successfully:", response.data);
  } catch (error) {
    console.error(
      "Error Fetching Refund Details:",
      error.response?.data || error.message
    );
  }
};

// Function to Read the order_id from order_data.json
const readOrderIdFromFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile("order_data.json", "utf8", (err, data) => {
      if (err) {
        reject(`Error reading order_data.json: ${err.message}`);
      } else {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.order_id); // Extract the order_id field
        } catch (parseError) {
          reject(`Error parsing order_data.json: ${parseError.message}`);
        }
      }
    });
  });
};

// Main Function to Execute the API Call
const main = async () => {
  try {
    const orderId = await readOrderIdFromFile(); // Fetch order ID dynamically
    console.log("Order ID:", orderId);

    // Call the function to fetch refund details
    await fetchRefundDetails(orderId);
  } catch (error) {
    console.error("Error:", error);
  }
};

// Call the Main Function
main();
