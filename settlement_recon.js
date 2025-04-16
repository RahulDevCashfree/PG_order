const fs = require("fs");
const axios = require("axios");

// API Endpoint
const url = "https://sandbox.cashfree.com/pg/settlement/recon";

// Headers
const headers = {
  accept: "application/json",
  "content-type": "application/json",
  "x-api-version": "2023-08-01",
  "x-client-id": "TEST1046158887d155c9e8211d92afcb88516401",
  "x-client-secret": "cfsk_ma_test_39540eff719307418bb4a5cfb8e914a3_3faa51fd",
};

// Request Body
const data = {
  pagination: {
    limit: 50,
  },
  filters: {
    //cf_settlement_id: 1646091739, // Ensure this is an integer, not a string
    start_date: "2025-04-02T10:00:00+05:30",
    end_date: "2025-04-03T12:56:00+05:30",
  },
};

// Function to Call API and Save Response
const fetchSettlementRecon = async () => {
  try {
    const response = await axios.post(url, data, { headers });

    // Save response to settlement_recon.json
    fs.writeFileSync("settlement_recon.json", JSON.stringify(response.data, null, 2));

    console.log("Settlement recon data saved successfully.");
  } catch (error) {
    console.error("Error fetching settlement recon:", error.response?.data || error.message);
  }
};

// Execute Function
fetchSettlementRecon();
