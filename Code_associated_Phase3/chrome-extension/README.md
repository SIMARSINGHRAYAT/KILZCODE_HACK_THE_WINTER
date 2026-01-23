# Recurring Payment Firewall Extension

A Chrome Extension to evaluate subscription transactions using the Recurring Payment Firewall API.

## Installation

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode" in the top right.
3. Click "Load unpacked" in the top left.
4. Select the `chrome-extension` folder in this directory.

## Configuration

1. Right-click the extension icon in the toolbar and select **Options**.
2. Enter your Firewall API Base URL (e.g., `http://localhost:3000` or your production URL).
3. Click **Save**.

## Usage

1. Click the extension icon to open the popup.
2. Fill in the transaction details manually or use one of the **Presets**:
   - **Good**: Simulates a legitimate subscription.
   - **Forced Trial**: Simulates abuse of free trials.
   - **Post-Cancel**: Simulates a charge after customer cancellation.
   - **Micro**: Simulates a small verification charge.
3. Click **Evaluate Transaction**.
4. View the Decision (ALLOW/REVIEW/BLOCK), Trust Score, and Risk Level.

## Features

- **Real-time Evaluation**: Calls the firewall API directly.
- **Visual Feedback**: Green/Yellow/Red indicators for decisions.
- **History**: Tracks the last 10 evaluations in the popup session.
- **Context Menu**: Right-click on any page to "Evaluate transaction" (sets a merchant hint).
