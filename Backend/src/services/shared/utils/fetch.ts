import {APP_PORT} from "#src/services/shared/constants/index.js";

// Server health check URL - update this with your server endpoint
const KEEP_AWAKE_URL = process.env.KEEP_AWAKE_URL || `http://localhost:${APP_PORT}`;

// Function to send GET request
export async function keepAwake() {
  try {
    const response = await fetch(KEEP_AWAKE_URL, {
      method: "GET"
    });
    if (!response.ok) {
      console.warn(`Health check failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("Health check request failed:", error);
  }
}
