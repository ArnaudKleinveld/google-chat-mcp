import { z } from "zod";
import { ResponseFormat, SpaceType, MembershipRole } from "../constants.js";

// Common schemas
export const ResponseFormatSchema = z.nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

export const PaginationSchema = z.object({
  pageSize: z.number()
    .int()
    .min(1)
    .max(100)
    .default(25)
    .describe("Maximum number of results to return (1-100)"),
  pageToken: z.string()
    .optional()
    .describe("Token for pagination to get the next page of results")
}).strict();

// Space schemas
export const ListSpacesInputSchema = z.object({
  pageSize: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of spaces to return (1-100)"),
  pageToken: z.string().optional()
    .describe("Token for pagination"),
  filter: z.string().optional()
    .describe("Filter for spaces (e.g., 'spaceType = \"SPACE\"')"),
  response_format: ResponseFormatSchema
}).strict();

export const GetSpaceInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space (e.g., 'spaces/AAAA1234567')"),
  response_format: ResponseFormatSchema
}).strict();

export const CreateSpaceInputSchema = z.object({
  displayName: z.string()
    .min(1)
    .max(128)
    .describe("Display name of the space"),
  spaceType: z.nativeEnum(SpaceType)
    .default(SpaceType.SPACE)
    .describe("Type of space to create"),
  externalUserAllowed: z.boolean()
    .default(false)
    .describe("Whether external users can join"),
  description: z.string()
    .max(500)
    .optional()
    .describe("Description of the space"),
  guidelines: z.string()
    .max(5000)
    .optional()
    .describe("Space guidelines"),
  response_format: ResponseFormatSchema
}).strict();

export const UpdateSpaceInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space to update"),
  displayName: z.string()
    .min(1)
    .max(128)
    .optional()
    .describe("New display name"),
  description: z.string()
    .max(500)
    .optional()
    .describe("New description"),
  guidelines: z.string()
    .max(5000)
    .optional()
    .describe("New guidelines"),
  response_format: ResponseFormatSchema
}).strict();

export const DeleteSpaceInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space to delete")
}).strict();

export const SearchSpacesInputSchema = z.object({
  query: z.string()
    .min(1)
    .describe("Search query for finding spaces"),
  pageSize: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of results (1-100)"),
  pageToken: z.string().optional()
    .describe("Token for pagination"),
  response_format: ResponseFormatSchema
}).strict();

export const FindDirectMessageInputSchema = z.object({
  userId: z.string()
    .min(1)
    .describe("The user ID to find direct message with (e.g., 'users/123456789')"),
  response_format: ResponseFormatSchema
}).strict();

// Message schemas
export const ListMessagesInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space (e.g., 'spaces/AAAA1234567')"),
  pageSize: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of messages to return (1-100)"),
  pageToken: z.string().optional()
    .describe("Token for pagination"),
  filter: z.string().optional()
    .describe("Filter for messages (e.g., 'createTime > \"2023-01-01T00:00:00Z\"')"),
  orderBy: z.string().optional()
    .describe("Order messages by a field (e.g., 'createTime desc')"),
  showDeleted: z.boolean().default(false)
    .describe("Whether to include deleted messages"),
  response_format: ResponseFormatSchema
}).strict();

export const GetMessageInputSchema = z.object({
  messageName: z.string()
    .min(1)
    .describe("The resource name of the message (e.g., 'spaces/AAAA/messages/BBBB')"),
  response_format: ResponseFormatSchema
}).strict();

export const CreateMessageInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space to send the message to"),
  text: z.string()
    .min(1)
    .max(4096)
    .describe("The message text content"),
  threadKey: z.string()
    .optional()
    .describe("Thread key to reply to a specific thread"),
  threadName: z.string()
    .optional()
    .describe("Thread name to reply to a specific thread"),
  messageReplyOption: z.enum(["MESSAGE_REPLY_OPTION_UNSPECIFIED", "REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD", "REPLY_MESSAGE_OR_FAIL"])
    .optional()
    .describe("How to handle thread replies"),
  messageId: z.string()
    .optional()
    .describe("Custom message ID (client-assigned)"),
  response_format: ResponseFormatSchema
}).strict();

export const UpdateMessageInputSchema = z.object({
  messageName: z.string()
    .min(1)
    .describe("The resource name of the message to update"),
  text: z.string()
    .min(1)
    .max(4096)
    .describe("The new message text content"),
  response_format: ResponseFormatSchema
}).strict();

export const DeleteMessageInputSchema = z.object({
  messageName: z.string()
    .min(1)
    .describe("The resource name of the message to delete"),
  force: z.boolean()
    .default(false)
    .describe("Force delete even if it has replies")
}).strict();

// Member schemas
export const ListMembersInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space"),
  pageSize: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of members to return (1-100)"),
  pageToken: z.string().optional()
    .describe("Token for pagination"),
  filter: z.string().optional()
    .describe("Filter for members (e.g., 'member.type = \"HUMAN\"')"),
  showGroups: z.boolean().default(false)
    .describe("Whether to include Google Groups"),
  showInvited: z.boolean().default(false)
    .describe("Whether to include invited members"),
  response_format: ResponseFormatSchema
}).strict();

export const GetMemberInputSchema = z.object({
  memberName: z.string()
    .min(1)
    .describe("The resource name of the membership (e.g., 'spaces/AAAA/members/BBBB')"),
  response_format: ResponseFormatSchema
}).strict();

export const CreateMemberInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space to add the member to"),
  userId: z.string()
    .min(1)
    .describe("The user ID to add (e.g., 'users/123456789')"),
  role: z.nativeEnum(MembershipRole)
    .default(MembershipRole.ROLE_MEMBER)
    .describe("The role for the member"),
  response_format: ResponseFormatSchema
}).strict();

export const DeleteMemberInputSchema = z.object({
  memberName: z.string()
    .min(1)
    .describe("The resource name of the membership to delete")
}).strict();

// Reaction schemas
export const ListReactionsInputSchema = z.object({
  messageName: z.string()
    .min(1)
    .describe("The resource name of the message (e.g., 'spaces/AAAA/messages/BBBB')"),
  pageSize: z.number().int().min(1).max(100).default(25)
    .describe("Maximum number of reactions to return (1-100)"),
  pageToken: z.string().optional()
    .describe("Token for pagination"),
  filter: z.string().optional()
    .describe("Filter for reactions (e.g., 'emoji.unicode = \"\\U0001F44D\"')"),
  response_format: ResponseFormatSchema
}).strict();

export const CreateReactionInputSchema = z.object({
  messageName: z.string()
    .min(1)
    .describe("The resource name of the message to react to"),
  emoji: z.string()
    .min(1)
    .describe("The emoji to use (unicode character, e.g., '\uD83D\uDC4D')"),
  response_format: ResponseFormatSchema
}).strict();

export const DeleteReactionInputSchema = z.object({
  reactionName: z.string()
    .min(1)
    .describe("The resource name of the reaction to delete")
}).strict();

// Attachment schemas
export const GetAttachmentInputSchema = z.object({
  attachmentName: z.string()
    .min(1)
    .describe("The resource name of the attachment"),
  response_format: ResponseFormatSchema
}).strict();

export const UploadAttachmentInputSchema = z.object({
  spaceName: z.string()
    .min(1)
    .describe("The resource name of the space to upload to"),
  filename: z.string()
    .min(1)
    .describe("The filename for the attachment"),
  contentType: z.string()
    .min(1)
    .describe("The MIME type of the file"),
  contentBase64: z.string()
    .min(1)
    .describe("The file content encoded as base64"),
  response_format: ResponseFormatSchema
}).strict();

// Type exports
export type ListSpacesInput = z.infer<typeof ListSpacesInputSchema>;
export type GetSpaceInput = z.infer<typeof GetSpaceInputSchema>;
export type CreateSpaceInput = z.infer<typeof CreateSpaceInputSchema>;
export type UpdateSpaceInput = z.infer<typeof UpdateSpaceInputSchema>;
export type DeleteSpaceInput = z.infer<typeof DeleteSpaceInputSchema>;
export type SearchSpacesInput = z.infer<typeof SearchSpacesInputSchema>;
export type FindDirectMessageInput = z.infer<typeof FindDirectMessageInputSchema>;
export type ListMessagesInput = z.infer<typeof ListMessagesInputSchema>;
export type GetMessageInput = z.infer<typeof GetMessageInputSchema>;
export type CreateMessageInput = z.infer<typeof CreateMessageInputSchema>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageInputSchema>;
export type DeleteMessageInput = z.infer<typeof DeleteMessageInputSchema>;
export type ListMembersInput = z.infer<typeof ListMembersInputSchema>;
export type GetMemberInput = z.infer<typeof GetMemberInputSchema>;
export type CreateMemberInput = z.infer<typeof CreateMemberInputSchema>;
export type DeleteMemberInput = z.infer<typeof DeleteMemberInputSchema>;
export type ListReactionsInput = z.infer<typeof ListReactionsInputSchema>;
export type CreateReactionInput = z.infer<typeof CreateReactionInputSchema>;
export type DeleteReactionInput = z.infer<typeof DeleteReactionInputSchema>;
export type GetAttachmentInput = z.infer<typeof GetAttachmentInputSchema>;
export type UploadAttachmentInput = z.infer<typeof UploadAttachmentInputSchema>;
