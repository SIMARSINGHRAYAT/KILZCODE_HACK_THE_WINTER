# Fake Payment Portal

A simulated merchant frontend to test the Recurring Payment Firewall.

## Features

- **Merchant Simulation**: Choose from 4 different fake merchants with different risk profiles.
- **Scenario Testing**: "Good", "Forced-Trial", and "Micro-charge" preset buttons.
- **Real-time Scoring**: Connects to the local Firewall API to get live Trust Scores and Risk Levels.

## Setup

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Configure Environment**:
    Copy `.env.example` to `.env` (already done by default) and ensure the firewall URL is correct.
    ```
    NEXT_PUBLIC_FIREWALL_URL=http://localhost:3000
    ```

3.  **Run Development Server**:
    ```bash
    pnpm run dev --port 3001
    ```
    (Use a different port if the main firewall is running on 3000)

## Scenarios

- **Clean Subscriptions**: Should generally be ALLOWED.
- **Dark Trial Gym**: Sends high-value recurring transactions with "cancelled but charging" flags. Expect BLOCK/REVIEW.
- **MicroCharge Tools**: Sends $1.00 transactions rapidly. Expect BLOCK/REVIEW if repeated.
