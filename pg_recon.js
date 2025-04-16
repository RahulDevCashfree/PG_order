const axios = require('axios');

// Function to call the API based on the environment
const fetchReconData = async (environment) => {
  // Define the environment configurations
  const configs = {
    prod: {
      baseUrl: "https://api.cashfree.com/pg/recon",
      clientId: "145084e43c71b20eab47a2a4b80541",
      clientSecret: "4fd43d83c9728bcd520f6018dea066d68cdc41d"
    },
    test: {
      baseUrl: "https://sandbox.cashfree.com/pg/recon",
      clientId: "TEST1046158887d155c9e8211d92afcb88516401",
      clientSecret: "cfsk_ma_test_39540eff719307418bb4a5cfb8e914a3_3faa51fd"
    }
  };

  const config = configs[environment.toLowerCase()];

  if (!config) {
    console.error("Invalid environment specified. Use 'prod' or 'test'.");
    return;
  }

  // Prepare the request payload
  const payload = {
    filters: {
      start_date: "2025-04-06T10:00:00Z",
      end_date: "2025-04-08T00:00:00Z"
    },
    pagination: {
      limit: 50
    }
  };

  try {
    const response = await axios.post(config.baseUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": config.clientId,
        "x-client-secret": config.clientSecret,
        "x-request-id": Math.random().toString(36).substring(2) // Generate a random request ID
      }
    });

    console.log("API Response:", response.data);
  } catch (error) {
    console.error("Error calling API:", error.response ? error.response.data : error.message);
  }
};

// Call the function with either "prod" or "test"
fetchReconData("test"); // Change to "prod" for Production environment
