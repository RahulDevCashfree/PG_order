# PG_order

This repository provides sample Node.js scripts demonstrating how to interact with Cashfree's Payment Gateway (PG) APIs. It covers various functionalities such as order creation, payment processing, refunds, and status checks.

## Features

- **Order Management**: Create and manage orders using Cashfree's PG APIs.
- **Payment Processing**: Handle payments through different methods including card payments, UPI collect, UPI intent, and UPI QR.
- **Refund Handling**: Initiate refunds and check refund statuses.
- **Status Checks**: Retrieve payment and order statuses to ensure accurate tracking.
- **Reconciliation**: Perform payment and settlement reconciliation.

## Prerequisites

- Node.js installed on your machine.
- Cashfree sandbox or production account credentials.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/RahulDevCashfree/PG_order.git
   ```

2. Navigate to the project directory:
   ```bash
   cd PG_order
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure your Cashfree credentials in the appropriate configuration file or environment variables.

## Usage

- To create an order:
  ```bash
  node create_order.js
  ```

- To process a payment using card:
  ```bash
  node order_pay_card.js
  ```

- To initiate a refund:
  ```bash
  node create_refund.js
  ```

- To check payment status:
  ```bash
  node get_payment_by_id.js
  ```

Refer to each script for specific usage details and ensure that you have the necessary configurations set up before execution.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.
