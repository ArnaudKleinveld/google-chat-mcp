import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSpaceTools } from "./spaces.js";
import { registerMessageTools } from "./messages.js";
import { registerMemberTools } from "./members.js";
import { registerReactionTools } from "./reactions.js";
import { registerAttachmentTools } from "./attachments.js";

/**
 * Register all Google Chat tools with the MCP server.
 */
export function registerAllTools(server: McpServer): void {
  registerSpaceTools(server);
  registerMessageTools(server);
  registerMemberTools(server);
  registerReactionTools(server);
  registerAttachmentTools(server);
}
