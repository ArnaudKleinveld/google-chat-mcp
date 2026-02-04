#!/usr/bin/env node
/**
 * Google Chat MCP Server
 *
 * This MCP server provides tools to interact with the Google Chat API,
 * enabling LLMs to manage spaces, messages, members, reactions, and attachments
 * in Google Chat.
 *
 * Authentication:
 * Set one of the following environment variables:
 *   - GOOGLE_APPLICATION_CREDENTIALS: Path to service account JSON file
 *   - GOOGLE_SERVICE_ACCOUNT_JSON: Service account JSON as a string
 *   - GOOGLE_OAUTH_TOKEN: OAuth2 access token
 *
 * Usage:
 *   - stdio (default): Run as a subprocess
 *   - http: Set TRANSPORT=http for streamable HTTP mode
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initializeApiClient } from "./services/api-client.js";
import { registerAllTools } from "./tools/index.js";

// Create MCP server instance
const server = new McpServer({
  name: "google-chat-mcp-server",
  version: "1.0.0"
});

// Register all tools
registerAllTools(server);

/**
 * Run the server using stdio transport.
 */
async function runStdio(): Promise<void> {
  // Initialize the API client (will throw if auth is not configured)
  try {
    await initializeApiClient();
  } catch (error) {
    console.error("Failed to initialize Google Chat API client:");
    console.error(error instanceof Error ? error.message : String(error));
    console.error("");
    console.error("Please configure authentication by setting one of:");
    console.error("  - GOOGLE_APPLICATION_CREDENTIALS: Path to service account JSON file");
    console.error("  - GOOGLE_SERVICE_ACCOUNT_JSON: Service account JSON as a string");
    console.error("  - GOOGLE_OAUTH_TOKEN: OAuth2 access token");
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Chat MCP server running via stdio");
}

/**
 * Run the server using streamable HTTP transport.
 */
async function runHTTP(): Promise<void> {
  // Dynamic import to avoid requiring express if not using HTTP
  const express = await import("express");
  const { StreamableHTTPServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/streamableHttp.js"
  );

  // Initialize the API client
  try {
    await initializeApiClient();
  } catch (error) {
    console.error("Failed to initialize Google Chat API client:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const app = express.default();
  app.use(express.default.json());

  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    res.on("close", () => transport.close());

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "google-chat-mcp-server" });
  });

  const port = parseInt(process.env.PORT || "3000", 10);
  app.listen(port, () => {
    console.error(`Google Chat MCP server running on http://localhost:${port}/mcp`);
  });
}

// Main entry point
const transport = process.env.TRANSPORT || "stdio";

if (transport === "http") {
  runHTTP().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
