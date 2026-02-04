import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import {
  formatSpace,
  formatSpacesList
} from "../services/formatters.js";
import {
  ListSpacesInputSchema,
  GetSpaceInputSchema,
  CreateSpaceInputSchema,
  UpdateSpaceInputSchema,
  DeleteSpaceInputSchema,
  SearchSpacesInputSchema,
  FindDirectMessageInputSchema,
  type ListSpacesInput,
  type GetSpaceInput,
  type CreateSpaceInput,
  type UpdateSpaceInput,
  type DeleteSpaceInput,
  type SearchSpacesInput,
  type FindDirectMessageInput
} from "../schemas/index.js";
import type { Space, ListSpacesResponse, SearchSpacesResponse } from "../types.js";
import { ResponseFormat } from "../constants.js";

/**
 * Register all space-related tools.
 */
export function registerSpaceTools(server: McpServer): void {
  // List spaces
  server.registerTool(
    "google_chat_list_spaces",
    {
      title: "List Google Chat Spaces",
      description: `List spaces the authenticated user or app is a member of.

Args:
  - pageSize (number): Maximum number of spaces to return, 1-100 (default: 25)
  - pageToken (string): Token for pagination to get the next page
  - filter (string): Optional filter (e.g., 'spaceType = "SPACE"')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of spaces with their names, display names, types, and metadata.

Examples:
  - "List all my spaces" -> params with no filter
  - "List only group spaces" -> params with filter='spaceType = "SPACE"'
  - "Get next page" -> params with pageToken from previous response`,
      inputSchema: ListSpacesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: ListSpacesInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          pageSize: params.pageSize
        };
        if (params.pageToken) queryParams.pageToken = params.pageToken;
        if (params.filter) queryParams.filter = params.filter;

        const response = await makeApiRequest<ListSpacesResponse>(
          "spaces",
          "GET",
          undefined,
          queryParams
        );

        const spaces = response.spaces || [];
        const hasMore = !!response.nextPageToken;
        const text = formatSpacesList(spaces, params.response_format, hasMore, response.nextPageToken);

        return {
          content: [{ type: "text", text }],
          structuredContent: {
            count: spaces.length,
            spaces,
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

  // Get space
  server.registerTool(
    "google_chat_get_space",
    {
      title: "Get Google Chat Space",
      description: `Get details about a specific space.

Args:
  - spaceName (string): The resource name of the space (e.g., 'spaces/AAAA1234567')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Space details including name, display name, type, description, and member count.

Examples:
  - "Get space details" -> params with spaceName='spaces/AAAA1234567'`,
      inputSchema: GetSpaceInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: GetSpaceInput) => {
      try {
        const space = await makeApiRequest<Space>(
          params.spaceName,
          "GET"
        );

        const text = formatSpace(space, params.response_format);

        return {
          content: [{ type: "text", text }],
          structuredContent: space
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Create space
  server.registerTool(
    "google_chat_create_space",
    {
      title: "Create Google Chat Space",
      description: `Create a new Google Chat space.

Args:
  - displayName (string): Display name of the space (required, max 128 chars)
  - spaceType ('SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE'): Type of space (default: 'SPACE')
  - externalUserAllowed (boolean): Whether external users can join (default: false)
  - description (string): Description of the space (optional, max 500 chars)
  - guidelines (string): Space guidelines (optional, max 5000 chars)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  The created space with its resource name and details.

Examples:
  - "Create a team space" -> params with displayName='Engineering Team'
  - "Create a space with description" -> params with displayName='Project X', description='Space for Project X discussions'`,
      inputSchema: CreateSpaceInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: CreateSpaceInput) => {
      try {
        const spaceData: Record<string, unknown> = {
          displayName: params.displayName,
          spaceType: params.spaceType,
          externalUserAllowed: params.externalUserAllowed
        };

        if (params.description || params.guidelines) {
          spaceData.spaceDetails = {
            description: params.description,
            guidelines: params.guidelines
          };
        }

        const space = await makeApiRequest<Space>(
          "spaces",
          "POST",
          spaceData
        );

        const text = formatSpace(space, params.response_format);

        return {
          content: [{ type: "text", text: `Space created successfully!\n\n${text}` }],
          structuredContent: space
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Update space
  server.registerTool(
    "google_chat_update_space",
    {
      title: "Update Google Chat Space",
      description: `Update an existing Google Chat space.

Args:
  - spaceName (string): The resource name of the space to update (required)
  - displayName (string): New display name (optional)
  - description (string): New description (optional)
  - guidelines (string): New guidelines (optional)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  The updated space details.

Examples:
  - "Rename a space" -> params with spaceName='spaces/AAAA', displayName='New Name'
  - "Update description" -> params with spaceName='spaces/AAAA', description='Updated description'`,
      inputSchema: UpdateSpaceInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: UpdateSpaceInput) => {
      try {
        const updateMask: string[] = [];
        const spaceData: Record<string, unknown> = {};

        if (params.displayName) {
          spaceData.displayName = params.displayName;
          updateMask.push("displayName");
        }

        if (params.description !== undefined || params.guidelines !== undefined) {
          spaceData.spaceDetails = {};
          if (params.description !== undefined) {
            (spaceData.spaceDetails as Record<string, unknown>).description = params.description;
            updateMask.push("spaceDetails.description");
          }
          if (params.guidelines !== undefined) {
            (spaceData.spaceDetails as Record<string, unknown>).guidelines = params.guidelines;
            updateMask.push("spaceDetails.guidelines");
          }
        }

        if (updateMask.length === 0) {
          return {
            isError: true,
            content: [{ type: "text", text: "Error: At least one field must be provided to update." }]
          };
        }

        const space = await makeApiRequest<Space>(
          params.spaceName,
          "PATCH",
          spaceData,
          { updateMask: updateMask.join(",") }
        );

        const text = formatSpace(space, params.response_format);

        return {
          content: [{ type: "text", text: `Space updated successfully!\n\n${text}` }],
          structuredContent: space
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Delete space
  server.registerTool(
    "google_chat_delete_space",
    {
      title: "Delete Google Chat Space",
      description: `Delete a Google Chat space. This action is irreversible.

Args:
  - spaceName (string): The resource name of the space to delete (required)

Returns:
  Confirmation of deletion.

Examples:
  - "Delete a space" -> params with spaceName='spaces/AAAA1234567'

Warning: This permanently deletes the space and all its messages.`,
      inputSchema: DeleteSpaceInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: DeleteSpaceInput) => {
      try {
        await makeApiRequest<void>(
          params.spaceName,
          "DELETE"
        );

        return {
          content: [{ type: "text", text: `Space \`${params.spaceName}\` has been deleted.` }],
          structuredContent: { deleted: true, spaceName: params.spaceName }
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Search spaces
  server.registerTool(
    "google_chat_search_spaces",
    {
      title: "Search Google Chat Spaces",
      description: `Search for spaces in the organization.

Args:
  - query (string): Search query for finding spaces (required)
  - pageSize (number): Maximum number of results, 1-100 (default: 25)
  - pageToken (string): Token for pagination
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of matching spaces with their details.

Examples:
  - "Search for engineering spaces" -> params with query='engineering'
  - "Find project spaces" -> params with query='project'

Note: Requires domain-wide delegation for service accounts.`,
      inputSchema: SearchSpacesInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: SearchSpacesInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          query: params.query,
          pageSize: params.pageSize
        };
        if (params.pageToken) queryParams.pageToken = params.pageToken;

        const response = await makeApiRequest<SearchSpacesResponse>(
          "spaces:search",
          "GET",
          undefined,
          queryParams
        );

        const spaces = response.spaces || [];
        const hasMore = !!response.nextPageToken;
        const text = formatSpacesList(spaces, params.response_format, hasMore, response.nextPageToken);

        return {
          content: [{ type: "text", text }],
          structuredContent: {
            count: spaces.length,
            totalSize: response.totalSize,
            spaces,
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

  // Find direct message
  server.registerTool(
    "google_chat_find_direct_message",
    {
      title: "Find Direct Message Space",
      description: `Find an existing direct message space with a specific user.

Args:
  - userId (string): The user ID to find direct message with (e.g., 'users/123456789')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  The direct message space if it exists, or an error if not found.

Examples:
  - "Find DM with user" -> params with userId='users/123456789'`,
      inputSchema: FindDirectMessageInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: FindDirectMessageInput) => {
      try {
        const space = await makeApiRequest<Space>(
          "spaces:findDirectMessage",
          "GET",
          undefined,
          { name: params.userId }
        );

        const text = formatSpace(space, params.response_format);

        return {
          content: [{ type: "text", text }],
          structuredContent: space
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
