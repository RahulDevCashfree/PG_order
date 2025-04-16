const axios = require("axios");
const fs = require("fs"); // Required to read files

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
    process.exit(1); // Exit the process if the configuration cannot be loaded
  }
};

// Fetch Cashfree Credentials Dynamically
const Cashfree = loadConfig();

// Base URL Based on Environment
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/orders"
    : "https://sandbox.cashfree.com/pg/orders";

// Function to Fetch Specific Order Details
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

    console.log("Order Details Fetched Successfully:", response.data);
  } catch (error) {
    console.error(
      "Error Fetching Order Details:",
      error.response?.data || error.message
    );
  }
};

// Read the order_id from order_data.json file
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

    // Call the function to fetch order details
    await fetchOrderDetails(orderId);
  } catch (error) {
    console.error("Error:", error);
  }
};

// Call the Main Function
main();
