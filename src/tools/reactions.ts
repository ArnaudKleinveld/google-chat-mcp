import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import {
  formatReaction,
  formatReactionsList
} from "../services/formatters.js";
import {
  ListReactionsInputSchema,
  CreateReactionInputSchema,
  DeleteReactionInputSchema,
  type ListReactionsInput,
  type CreateReactionInput,
  type DeleteReactionInput
} from "../schemas/index.js";
import type { Reaction, ListReactionsResponse } from "../types.js";

/**
 * Register all reaction-related tools.
 */
export function registerReactionTools(server: McpServer): void {
  // List reactions
  server.registerTool(
    "google_chat_list_reactions",
    {
      title: "List Google Chat Message Reactions",
      description: `List reactions on a Google Chat message.

Args:
  - messageName (string): The resource name of the message (e.g., 'spaces/AAAA/messages/BBBB')
  - pageSize (number): Maximum number of reactions to return, 1-100 (default: 25)
  - pageToken (string): Token for pagination
  - filter (string): Optional filter for reactions (e.g., 'emoji.unicode = "👍"')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of reactions grouped by emoji with user information.

Examples:
  - "List all reactions" -> params with messageName='spaces/AAAA/messages/BBBB'
  - "List thumbs up only" -> params with messageName='spaces/AAAA/messages/BBBB', filter='emoji.unicode = "👍"'`,
      inputSchema: ListReactionsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: ListReactionsInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          pageSize: params.pageSize
        };
        if (params.pageToken) queryParams.pageToken = params.pageToken;
        if (params.filter) queryParams.filter = params.filter;

        const response = await makeApiRequest<ListReactionsResponse>(
          `${params.messageName}/reactions`,
          "GET",
          undefined,
          queryParams
        );

        const reactions = response.reactions || [];
        const hasMore = !!response.nextPageToken;
        const text = formatReactionsList(reactions, params.response_format, hasMore, response.nextPageToken);

        return {
          content: [{ type: "text", text }],
          structuredContent: {
            count: reactions.length,
            reactions,
            hasMore,
            nextPageToken: response.nextPageToken
          }
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Create reaction
  server.registerTool(
    "google_chat_create_reaction",
    {
      title: "Add Google Chat Reaction",
      description: `Add a reaction to a Google Chat message.

Args:
  - messageName (string): The resource name of the message to react to (required)
  - emoji (string): The emoji to use (unicode character, e.g., '👍', '❤️', '🎉')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  The created reaction with its resource name.

Examples:
  - "Add thumbs up" -> params with messageName='spaces/AAAA/messages/BBBB', emoji='👍'
  - "Add heart reaction" -> params with messageName='spaces/AAAA/messages/BBBB', emoji='❤️'

Note: You can only add one reaction per emoji per user. Adding the same emoji again will fail.`,
      inputSchema: CreateReactionInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: CreateReactionInput) => {
      try {
        const reactionData = {
          emoji: {
            unicode: params.emoji
          }
        };

        const reaction = await makeApiRequest<Reaction>(
          `${params.messageName}/reactions`,
          "POST",
          reactionData
        );

        const text = formatReaction(reaction, params.response_format);

        return {
          content: [{ type: "text", text: `Reaction added successfully!\n\n${text}` }],
          structuredContent: reaction
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Delete reaction
  server.registerTool(
    "google_chat_delete_reaction",
    {
      title: "Remove Google Chat Reaction",
      description: `Remove a reaction from a Google Chat message.

Args:
  - reactionName (string): The resource name of the reaction to delete (required)

Returns:
  Confirmation of removal.

Examples:
  - "Remove reaction" -> params with reactionName='spaces/AAAA/messages/BBBB/reactions/CCCC'

Note: You can only remove your own reactions.`,
      inputSchema: DeleteReactionInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: DeleteReactionInput) => {
      try {
        await makeApiRequest<void>(
          params.reactionName,
          "DELETE"
        );

        return {
          content: [{ type: "text", text: `Reaction \`${params.reactionName}\` has been removed.` }],
          structuredContent: { deleted: true, reactionName: params.reactionName }
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );
}
