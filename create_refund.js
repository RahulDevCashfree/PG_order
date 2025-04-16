const axios = require("axios");
const fs = require("fs"); // Required to read/write files
const path = require("path"); // For handling file paths

// Function to Load API Keys and Configurations from JSON
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

// Function to Initiate a Refund
const initiateRefund = async (orderId) => {
  // Generate refund_id dynamically using the current timestamp
  const refundId = `Refund-${Date.now()}`;
  const refundData = {
    refund_amount: 10000, // Example refund amount
    refund_id: refundId, // Dynamically generated refund ID
    refund_note: "refund note for reference", // Example refund note
    refund_speed: "STANDARD", // Refund speed (can be "STANDARD" or "EXPRESS")
  };

  try {
    const response = await axios.post(`${baseURL}/${orderId}/refunds`, refundData, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": config.client_id,
        "x-client-secret": config.client_secret,
      },
    });

    console.log("Refund Initiated Successfully:", response.data);

    // Save refund_id and other refund details into refund_data.json
    const refundRecord = {
      refund_id: refundId,
      order_id: orderId,
      refund_amount: refundData.refund_amount,
      refund_status: "Initiated",
      initiated_at: new Date().toISOString(),
    };

    saveRefundData(refundRecord);
  } catch (error) {
    console.error(
      "Error Initiating Refund:",
      error.response?.data || error.message
    );
  }
};

// Function to Save Refund Data to refund_data.json
const saveRefundData = (refundRecord) => {
  const filePath = "refund_data.json";

  // Check if the file exists and read its content
  fs.readFile(filePath, "utf8", (err, data) => {
    let refundDataArray = [];

    if (!err && data) {
      try {
        refundDataArray = JSON.parse(data); // Parse existing refund data
      } catch (parseError) {
        console.error("Error parsing existing refund_data.json:", parseError);
      }
    }

    // Append the new refund record to the array
    refundDataArray.push(refundRecord);

    // Write the updated data back to refund_data.json
    fs.writeFile(filePath, JSON.stringify(refundDataArray, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error saving refund data:", writeErr);
      } else {
        console.log("Refund data saved successfully to refund_data.json");
      }
    });
  });
};

// Read the order_id from order_data.json file
fs.readFile("order_data.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading order_data.json file:", err);
    return;
  }

  try {
    const orderData = JSON.parse(data);
    const orderId = orderData.order_id; // Extract the order_id from the JSON file

    // Call the initiateRefund function with the dynamically fetched order_id
    initiateRefund(orderId);
  } catch (parseError) {
    console.error("Error parsing order_data.json:", parseError);
  }
});
