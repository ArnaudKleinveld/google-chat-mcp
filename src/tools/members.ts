import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import {
  formatMember,
  formatMembersList
} from "../services/formatters.js";
import {
  ListMembersInputSchema,
  GetMemberInputSchema,
  CreateMemberInputSchema,
  DeleteMemberInputSchema,
  type ListMembersInput,
  type GetMemberInput,
  type CreateMemberInput,
  type DeleteMemberInput
} from "../schemas/index.js";
import type { Member, ListMembersResponse } from "../types.js";

/**
 * Register all member-related tools.
 */
export function registerMemberTools(server: McpServer): void {
  // List members
  server.registerTool(
    "google_chat_list_members",
    {
      title: "List Google Chat Space Members",
      description: `List members of a Google Chat space.

Args:
  - spaceName (string): The resource name of the space (e.g., 'spaces/AAAA1234567')
  - pageSize (number): Maximum number of members to return, 1-100 (default: 25)
  - pageToken (string): Token for pagination
  - filter (string): Optional filter (e.g., 'member.type = "HUMAN"')
  - showGroups (boolean): Include Google Groups (default: false)
  - showInvited (boolean): Include invited members (default: false)
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  List of members with their names, roles, and membership states.

Examples:
  - "List all members" -> params with spaceName='spaces/AAAA'
  - "List only humans" -> params with spaceName='spaces/AAAA', filter='member.type = "HUMAN"'
  - "Include invited" -> params with spaceName='spaces/AAAA', showInvited=true`,
      inputSchema: ListMembersInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: ListMembersInput) => {
      try {
        const queryParams: Record<string, unknown> = {
          pageSize: params.pageSize
        };
        if (params.pageToken) queryParams.pageToken = params.pageToken;
        if (params.filter) queryParams.filter = params.filter;
        if (params.showGroups) queryParams.showGroups = params.showGroups;
        if (params.showInvited) queryParams.showInvited = params.showInvited;

        const response = await makeApiRequest<ListMembersResponse>(
          `${params.spaceName}/members`,
          "GET",
          undefined,
          queryParams
        );

        const members = response.memberships || [];
        const hasMore = !!response.nextPageToken;
        const text = formatMembersList(members, params.response_format, hasMore, response.nextPageToken);

        return {
          content: [{ type: "text", text }],
          structuredContent: {
            count: members.length,
            memberships: members,
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

  // Get member
  server.registerTool(
    "google_chat_get_member",
    {
      title: "Get Google Chat Space Member",
      description: `Get details about a specific membership in a Google Chat space.

Args:
  - memberName (string): The resource name of the membership (e.g., 'spaces/AAAA/members/BBBB')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  Membership details including user info, role, and state.

Examples:
  - "Get member details" -> params with memberName='spaces/AAAA/members/BBBB'`,
      inputSchema: GetMemberInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: GetMemberInput) => {
      try {
        const member = await makeApiRequest<Member>(
          params.memberName,
          "GET"
        );

        const text = formatMember(member, params.response_format);

        return {
          content: [{ type: "text", text }],
          structuredContent: member
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Create member
  server.registerTool(
    "google_chat_create_member",
    {
      title: "Add Google Chat Space Member",
      description: `Add a member to a Google Chat space.

Args:
  - spaceName (string): The resource name of the space (required)
  - userId (string): The user ID to add (e.g., 'users/123456789')
  - role ('ROLE_UNSPECIFIED' | 'ROLE_MEMBER' | 'ROLE_MANAGER'): The role for the member (default: 'ROLE_MEMBER')
  - response_format ('markdown' | 'json'): Output format (default: 'markdown')

Returns:
  The created membership with its resource name and details.

Examples:
  - "Add a member" -> params with spaceName='spaces/AAAA', userId='users/123456789'
  - "Add a manager" -> params with spaceName='spaces/AAAA', userId='users/123456789', role='ROLE_MANAGER'`,
      inputSchema: CreateMemberInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true
      }
    },
    async (params: CreateMemberInput) => {
      try {
        const memberData = {
          member: {
            name: params.userId,
            type: "HUMAN"
          },
          role: params.role
        };

        const member = await makeApiRequest<Member>(
          `${params.spaceName}/members`,
          "POST",
          memberData
        );

        const text = formatMember(member, params.response_format);

        return {
          content: [{ type: "text", text: `Member added successfully!\n\n${text}` }],
          structuredContent: member
        };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: handleApiError(error) }]
        };
      }
    }
  );

  // Delete member
  server.registerTool(
    "google_chat_delete_member",
    {
      title: "Remove Google Chat Space Member",
      description: `Remove a member from a Google Chat space.

Args:
  - memberName (string): The resource name of the membership to delete (required)

Returns:
  Confirmation of removal.

Examples:
  - "Remove a member" -> params with memberName='spaces/AAAA/members/BBBB'

Note: Removing a member also removes their access to the space's messages and history.`,
      inputSchema: DeleteMemberInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true
      }
    },
    async (params: DeleteMemberInput) => {
      try {
        await makeApiRequest<void>(
          params.memberName,
          "DELETE"
        );

        return {
          content: [{ type: "text", text: `Member \`${params.memberName}\` has been removed from the space.` }],
          structuredContent: { deleted: true, memberName: params.memberName }
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
