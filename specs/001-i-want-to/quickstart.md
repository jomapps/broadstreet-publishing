# Quickstart Guide

This guide provides instructions on how to set up and run the Campaign Management Dashboard application.

## Prerequisites

- Node.js (latest LTS version)
- npm or yarn
- Access to a MongoDB instance
- A Broadstreet API access token

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables:
    ```
    MONGODB_URI=<your-mongodb-connection-string>
    BROADSTREET_API_TOKEN=<your-broadstreet-api-token>
    ```

## Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  **Open the application:**
    Open your web browser and navigate to `http://localhost:3000`.

## Running Tests

-   **Unit and Integration Tests:**
    ```bash
    npm run test
    ```

-   **End-to-End Tests:**
    ```bash
    npm run cypress:open
    ```
