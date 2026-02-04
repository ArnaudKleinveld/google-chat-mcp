import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import {
  formatMessage,
  formatMessagesList
} from "../services/formatters.js";
import {
  ListMessagesInputSchema,
  GetMessageInputSchema,
  CreateMessageInputSchema,
  UpdateMessageInputSchema,
  DeleteMessageInputSchema,
  type ListMessagesInput,
  type GetMessageInput,
  type CreateMessageInput,
  type UpdateMessageInput,
  type DeleteMessageInput
} from "../schemas/index.js";
import type { Message, ListMessagesResponse } from "../types.js";

/**
 * Register all message-related tools.
 */
export function registerMessageTools(server: McpServer): void {
  // List messages
  server.registerTool(
    "google_chat_list_messages",
    {
      title: "List Google Chat Messages",
      description: `List messages in a Google Chat space.

Args:
  - spaceName (string): The resource name of the space (e.g., 'spaces/AAAA1234567')
  - pageSize (number): Maximum number of messages to return, 1-100 (default: 25)
  - pageToken (string): Token for pagination
  - filter (string): Optional filter (e.g., 'createTime > "2023-01-01T00:00:00Z"')
  - orderBy (string): Order by field (e.g., 'createTime desc')
  - showDeleted (boolean): Include deleted messages (default: false)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of messages with sender, time, content, and reactions.

Examples:
  - "List recent messages" -> params with spaceName='spaces/AAAA'
  - "Get messages from today" -> params with spaceName='spaces/AAAA', filter='createTime > "2024-01-01T00:00:00Z"'`,
      inputSchema: ListMessagesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: ListMessagesInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          pageSize: params.pageSize
        };
        if (params.pageToken) queryParams.pageToken = params.pageToken;
        if (params.filter) queryParams.filter = params.filter;
        if (params.orderBy) queryParams.orderBy = params.orderBy;
        if (params.showDeleted) queryParams.showDeleted = params.showDeleted;

        const response = await makeApiRequest<ListMessagesResponse>(
          `${params.spaceName}/messages`,
          "GET",
          undefined,
          queryParams
        );

        const messages = response.messages || [];
        const hasMore = !!response.nextPageToken;
        const text = formatMessagesList(messages, params.response_format, hasMore, response.nextPageToken);

        return {
          content: [{ type: "text", text }],
          structuredContent: {
            count: messages.length,
            messages,
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

  // Get message
  server.registerTool(
    "google_chat_get_message",
    {
      title: "Get Google Chat Message",
      description: `Get details about a specific message.

Args:
  - messageName (string): The resource name of the message (e.g., 'spaces/AAAA/messages/BBBB')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Message details including sender, content, timestamp, and reactions.

Examples:
  - "Get message details" -> params with messageName='spaces/AAAA/messages/BBBB'`,
      inputSchema: GetMessageInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: GetMessageInput) => {
      try {
        const message = await makeApiRequest<Message>(
          params.messageName,
          "GET"
        );

        const text = formatMessage(message, params.response_format);

        return {
          content: [{ type: "text", text }],
          structuredContent: message
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Create message
  server.registerTool(
    "google_chat_create_message",
    {
      title: "Send Google Chat Message",
      description: `Send a message to a Google Chat space.

Args:
  - spaceName (string): The resource name of the space (required)
  - text (string): The message text content (required, max 4096 chars)
  - threadKey (string): Thread key to reply to a specific thread (optional)
  - threadName (string): Thread name to reply to a specific thread (optional)
  - messageReplyOption (string): How to handle thread replies (optional)
  - messageId (string): Custom message ID (optional)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  The created message with its resource name and details.

Examples:
  - "Send a message" -> params with spaceName='spaces/AAAA', text='Hello everyone!'
  - "Reply to a thread" -> params with spaceName='spaces/AAAA', text='Reply', threadName='spaces/AAAA/threads/BBBB'`,
      inputSchema: CreateMessageInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: CreateMessageInput) => {
      try {
        const messageData: Record<string, unknown> = {
          text: params.text
        };

        // Handle thread configuration
        if (params.threadKey || params.threadName) {
          messageData.thread = {};
          if (params.threadKey) {
            (messageData.thread as Record<string, unknown>).threadKey = params.threadKey;
          }
          if (params.threadName) {
            (messageData.thread as Record<string, unknown>).name = params.threadName;
          }
        }

        const queryParams: Record<string, unknown> = {};
        if (params.messageReplyOption) {
          queryParams.messageReplyOption = params.messageReplyOption;
        }
        if (params.messageId) {
          queryParams.messageId = params.messageId;
        }

        const message = await makeApiRequest<Message>(
          `${params.spaceName}/messages`,
          "POST",
          messageData,
          Object.keys(queryParams).length > 0 ? queryParams : undefined
        );

        const text = formatMessage(message, params.response_format);

        return {
          content: [{ type: "text", text: `Message sent successfully!\n\n${text}` }],
          structuredContent: message
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Update message
  server.registerTool(
    "google_chat_update_message",
    {
      title: "Update Google Chat Message",
      description: `Update an existing message in Google Chat.

Args:
  - messageName (string): The resource name of the message to update (required)
  - text (string): The new message text content (required, max 4096 chars)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  The updated message details.

Examples:
  - "Edit a message" -> params with messageName='spaces/AAAA/messages/BBBB', text='Updated content'

Note: Only the text content can be updated. Cards and attachments cannot be modified.`,
      inputSchema: UpdateMessageInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: UpdateMessageInput) => {
      try {
        const messageData = {
          text: params.text
        };

        const message = await makeApiRequest<Message>(
          params.messageName,
          "PATCH",
          messageData,
          { updateMask: "text" }
        );

        const text = formatMessage(message, params.response_format);

        return {
          content: [{ type: "text", text: `Message updated successfully!\n\n${text}` }],
          structuredContent: message
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Delete message
  server.registerTool(
    "google_chat_delete_message",
    {
      title: "Delete Google Chat Message",
      description: `Delete a message from Google Chat.

Args:
  - messageName (string): The resource name of the message to delete (required)
  - force (boolean): Force delete even if it has replies (default: false)

Returns:
  Confirmation of deletion.

Examples:
  - "Delete a message" -> params with messageName='spaces/AAAA/messages/BBBB'
  - "Force delete" -> params with messageName='spaces/AAAA/messages/BBBB', force=true

Warning: This action is irreversible.`,
      inputSchema: DeleteMessageInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: DeleteMessageInput) => {
      try {
        const queryParams: Record<string, unknown> = {};
        if (params.force) {
          queryParams.force = params.force;
        }

        await makeApiRequest<void>(
          params.messageName,
          "DELETE",
          undefined,
          Object.keys(queryParams).length > 0 ? queryParams : undefined
        );

        return {
          content: [{ type: "text", text: `Message \`${params.messageName}\` has been deleted.` }],
          structuredContent: { deleted: true, messageName: params.messageName }
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
