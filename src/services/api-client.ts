import axios, { AxiosError, AxiosInstance } from "axios";
import { GoogleAuth, OAuth2Client } from "google-auth-library";
import { API_BASE_URL } from "../constants.js";

// Google Chat API scopes
const CHAT_SCOPES = [
  "https://www.googleapis.com/auth/chat.spaces",
  "https://www.googleapis.com/auth/chat.spaces.readonly",
  "https://www.googleapis.com/auth/chat.messages",
  "https://www.googleapis.com/auth/chat.messages.readonly",
  "https://www.googleapis.com/auth/chat.memberships",
  "https://www.googleapis.com/auth/chat.memberships.readonly",
  "https://www.googleapis.com/auth/chat.spaces.create",
  "https://www.googleapis.com/auth/chat.delete",
  "https://www.googleapis.com/auth/chat.import"
];

let apiClient: AxiosInstance | null = null;
let authClient: GoogleAuth | OAuth2Client | null = null;

/**
 * Initialize the Google Chat API client with authentication.
 * Supports both service account and OAuth2 authentication.
 */
export async function initializeApiClient(): Promise<void> {
  // Check for service account credentials
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const oauthToken = process.env.GOOGLE_OAUTH_TOKEN;

  if (serviceAccountPath || serviceAccountJson) {
    // Use service account authentication
    const authOptions: { scopes: string[]; credentials?: object } = {
      scopes: CHAT_SCOPES
    };

    if (serviceAccountJson) {
      try {
        authOptions.credentials = JSON.parse(serviceAccountJson);
      } catch {
        throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_JSON: must be valid JSON");
      }
    }

    authClient = new GoogleAuth(authOptions);
  } else if (oauthToken) {
    // Use OAuth2 token directly
    authClient = new OAuth2Client();
    authClient.setCredentials({ access_token: oauthToken });
  } else {
    throw new Error(
      "Authentication required. Set one of:\n" +
      "  - GOOGLE_APPLICATION_CREDENTIALS: Path to service account JSON file\n" +
      "  - GOOGLE_SERVICE_ACCOUNT_JSON: Service account JSON as a string\n" +
      "  - GOOGLE_OAUTH_TOKEN: OAuth2 access token"
    );
  }

  apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }
  });

  // Add request interceptor to attach auth token
  apiClient.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

/**
 * Get access token from the auth client.
 */
async function getAccessToken(): Promise<string> {
  if (!authClient) {
    throw new Error("API client not initialized. Call initializeApiClient() first.");
  }

  if (authClient instanceof OAuth2Client) {
    const credentials = authClient.credentials;
    if (credentials.access_token) {
      return credentials.access_token;
    }
    throw new Error("OAuth2 token expired or invalid");
  }

  // GoogleAuth (service account)
  const client = await authClient.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) {
    throw new Error("Failed to obtain access token");
  }
  return tokenResponse.token;
}

/**
 * Make an API request to Google Chat API.
 */
export async function makeApiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: unknown,
  params?: Record<string, unknown>
): Promise<T> {
  if (!apiClient) {
    await initializeApiClient();
  }

  const response = await apiClient!({
    method,
    url: endpoint,
    data,
    params
  });

  return response.data;
}

/**
 * Handle API errors and return user-friendly messages.
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = data?.error?.message || data?.message || "Unknown error";

      switch (status) {
        case 400:
          return `Error: Bad request - ${message}. Check your parameters and try again.`;
        case 401:
          return "Error: Authentication failed. Please check your credentials and ensure they have the required permissions.";
        case 403:
          return `Error: Permission denied - ${message}. Ensure the app has the required Chat API scopes.`;
        case 404:
          return `Error: Resource not found - ${message}. Check that the space/message/member ID is correct.`;
        case 409:
          return `Error: Conflict - ${message}. The resource may already exist or be in an invalid state.`;
        case 429:
          return "Error: Rate limit exceeded. Please wait before making more requests.";
        case 500:
          return "Error: Google Chat API server error. Please try again later.";
        case 503:
          return "Error: Google Chat API is temporarily unavailable. Please try again later.";
        default:
          return `Error: API request failed (${status}) - ${message}`;
      }
    } else if (error.code === "ECONNABORTED") {
      return "Error: Request timed out. Please try again.";
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return "Error: Unable to connect to Google Chat API. Check your network connection.";
    }
  }

  return `Error: Unexpected error - ${error instanceof Error ? error.message : String(error)}`;
}

/**
 * Check if the API client is initialized.
 */
export function isClientInitialized(): boolean {
  return apiClient !== null;
}
