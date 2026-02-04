import { ResponseFormat, CHARACTER_LIMIT } from "../constants.js";
import type { Space, Message, Member, Reaction, Attachment } from "../types.js";

/**
 * Format a space for display.
 */
export function formatSpace(space: Space, format: ResponseFormat): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(space, null, 2);
  }

  const lines: string[] = [];
  lines.push(`## ${space.displayName || "Unnamed Space"}`);
  lines.push(`- **Name**: ${space.name}`);
  lines.push(`- **Type**: ${space.spaceType || space.type || "Unknown"}`);

  if (space.spaceDetails?.description) {
    lines.push(`- **Description**: ${space.spaceDetails.description}`);
  }

  if (space.membershipCount) {
    const count = space.membershipCount.joinedDirectHumanUserCount || 0;
    lines.push(`- **Members**: ${count}`);
  }

  if (space.createTime) {
    lines.push(`- **Created**: ${formatTimestamp(space.createTime)}`);
  }

  if (space.threaded !== undefined) {
    lines.push(`- **Threaded**: ${space.threaded ? "Yes" : "No"}`);
  }

  if (space.externalUserAllowed !== undefined) {
    lines.push(`- **External Users Allowed**: ${space.externalUserAllowed ? "Yes" : "No"}`);
  }

  return lines.join("\n");
}

/**
 * Format a list of spaces.
 */
export function formatSpacesList(
  spaces: Space[],
  format: ResponseFormat,
  hasMore: boolean,
  nextPageToken?: string
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify({
      count: spaces.length,
      spaces,
      hasMore,
      nextPageToken
    }, null, 2);
  }

  if (spaces.length === 0) {
    return "No spaces found.";
  }

  const lines: string[] = [];
  lines.push(`# Spaces (${spaces.length} results)`);
  lines.push("");

  for (const space of spaces) {
    lines.push(`## ${space.displayName || "Unnamed Space"}`);
    lines.push(`- **ID**: \`${space.name}\``);
    lines.push(`- **Type**: ${space.spaceType || space.type || "Unknown"}`);
    if (space.spaceDetails?.description) {
      lines.push(`- **Description**: ${space.spaceDetails.description.substring(0, 100)}${space.spaceDetails.description.length > 100 ? "..." : ""}`);
    }
    lines.push("");
  }

  if (hasMore && nextPageToken) {
    lines.push(`---`);
    lines.push(`*More results available. Use pageToken: \`${nextPageToken}\`*`);
  }

  return truncateResponse(lines.join("\n"));
}

/**
 * Format a message for display.
 */
export function formatMessage(message: Message, format: ResponseFormat): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(message, null, 2);
  }

  const lines: string[] = [];
  lines.push(`## Message`);
  lines.push(`- **ID**: \`${message.name}\``);

  if (message.sender) {
    lines.push(`- **From**: ${message.sender.displayName || message.sender.name}`);
  }

  if (message.createTime) {
    lines.push(`- **Time**: ${formatTimestamp(message.createTime)}`);
  }

  if (message.text) {
    lines.push("");
    lines.push("### Content");
    lines.push(message.text);
  }

  if (message.thread?.name) {
    lines.push("");
    lines.push(`- **Thread**: \`${message.thread.name}\``);
  }

  if (message.emojiReactionSummaries && message.emojiReactionSummaries.length > 0) {
    const reactions = message.emojiReactionSummaries
      .map(r => `${r.emoji?.unicode || "?"} (${r.reactionCount})`)
      .join(" ");
    lines.push(`- **Reactions**: ${reactions}`);
  }

  return lines.join("\n");
}

/**
 * Format a list of messages.
 */
export function formatMessagesList(
  messages: Message[],
  format: ResponseFormat,
  hasMore: boolean,
  nextPageToken?: string
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify({
      count: messages.length,
      messages,
      hasMore,
      nextPageToken
    }, null, 2);
  }

  if (messages.length === 0) {
    return "No messages found.";
  }

  const lines: string[] = [];
  lines.push(`# Messages (${messages.length} results)`);
  lines.push("");

  for (const message of messages) {
    const sender = message.sender?.displayName || message.sender?.name || "Unknown";
    const time = message.createTime ? formatTimestamp(message.createTime) : "";
    const preview = message.text
      ? message.text.substring(0, 100) + (message.text.length > 100 ? "..." : "")
      : "[No text content]";

    lines.push(`### ${sender} - ${time}`);
    lines.push(`- **ID**: \`${message.name}\``);
    lines.push(`- **Content**: ${preview}`);
    lines.push("");
  }

  if (hasMore && nextPageToken) {
    lines.push(`---`);
    lines.push(`*More results available. Use pageToken: \`${nextPageToken}\`*`);
  }

  return truncateResponse(lines.join("\n"));
}

/**
 * Format a member for display.
 */
export function formatMember(member: Member, format: ResponseFormat): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(member, null, 2);
  }

  const lines: string[] = [];
  const displayName = member.member?.displayName || member.member?.name || "Unknown";

  lines.push(`## ${displayName}`);
  lines.push(`- **Membership ID**: \`${member.name}\``);
  lines.push(`- **State**: ${member.state || "Unknown"}`);
  lines.push(`- **Role**: ${member.role || "Unknown"}`);

  if (member.member?.type) {
    lines.push(`- **Type**: ${member.member.type}`);
  }

  if (member.createTime) {
    lines.push(`- **Joined**: ${formatTimestamp(member.createTime)}`);
  }

  return lines.join("\n");
}

/**
 * Format a list of members.
 */
export function formatMembersList(
  members: Member[],
  format: ResponseFormat,
  hasMore: boolean,
  nextPageToken?: string
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify({
      count: members.length,
      memberships: members,
      hasMore,
      nextPageToken
    }, null, 2);
  }

  if (members.length === 0) {
    return "No members found.";
  }

  const lines: string[] = [];
  lines.push(`# Members (${members.length} results)`);
  lines.push("");

  for (const member of members) {
    const displayName = member.member?.displayName || member.member?.name || "Unknown";
    lines.push(`## ${displayName}`);
    lines.push(`- **ID**: \`${member.name}\``);
    lines.push(`- **Role**: ${member.role || "Unknown"}`);
    lines.push(`- **State**: ${member.state || "Unknown"}`);
    lines.push("");
  }

  if (hasMore && nextPageToken) {
    lines.push(`---`);
    lines.push(`*More results available. Use pageToken: \`${nextPageToken}\`*`);
  }

  return truncateResponse(lines.join("\n"));
}

/**
 * Format a reaction for display.
 */
export function formatReaction(reaction: Reaction, format: ResponseFormat): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(reaction, null, 2);
  }

  const emoji = reaction.emoji?.unicode || reaction.emoji?.customEmoji?.uid || "?";
  const user = reaction.user?.displayName || reaction.user?.name || "Unknown";

  return `${emoji} by ${user} (\`${reaction.name}\`)`;
}

/**
 * Format a list of reactions.
 */
export function formatReactionsList(
  reactions: Reaction[],
  format: ResponseFormat,
  hasMore: boolean,
  nextPageToken?: string
): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify({
      count: reactions.length,
      reactions,
      hasMore,
      nextPageToken
    }, null, 2);
  }

  if (reactions.length === 0) {
    return "No reactions found.";
  }

  const lines: string[] = [];
  lines.push(`# Reactions (${reactions.length} results)`);
  lines.push("");

  // Group by emoji
  const grouped = new Map<string, { emoji: string; users: string[] }>();
  for (const reaction of reactions) {
    const emoji = reaction.emoji?.unicode || reaction.emoji?.customEmoji?.uid || "?";
    const user = reaction.user?.displayName || reaction.user?.name || "Unknown";

    if (!grouped.has(emoji)) {
      grouped.set(emoji, { emoji, users: [] });
    }
    grouped.get(emoji)!.users.push(user);
  }

  for (const [emoji, data] of grouped) {
    lines.push(`- ${emoji} (${data.users.length}): ${data.users.join(", ")}`);
  }

  if (hasMore && nextPageToken) {
    lines.push("");
    lines.push(`*More results available. Use pageToken: \`${nextPageToken}\`*`);
  }

  return lines.join("\n");
}

/**
 * Format an attachment for display.
 */
export function formatAttachment(attachment: Attachment, format: ResponseFormat): string {
  if (format === ResponseFormat.JSON) {
    return JSON.stringify(attachment, null, 2);
  }

  const lines: string[] = [];
  lines.push(`## Attachment`);
  lines.push(`- **Name**: \`${attachment.name}\``);

  if (attachment.contentName) {
    lines.push(`- **Filename**: ${attachment.contentName}`);
  }

  if (attachment.contentType) {
    lines.push(`- **Type**: ${attachment.contentType}`);
  }

  if (attachment.downloadUri) {
    lines.push(`- **Download URL**: ${attachment.downloadUri}`);
  }

  if (attachment.source) {
    lines.push(`- **Source**: ${attachment.source}`);
  }

  return lines.join("\n");
}

/**
 * Format a timestamp for display.
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return timestamp;
  }
}

/**
 * Truncate response if it exceeds character limit.
 */
function truncateResponse(text: string): string {
  if (text.length <= CHARACTER_LIMIT) {
    return text;
  }

  const truncated = text.substring(0, CHARACTER_LIMIT - 100);
  return truncated + "\n\n---\n*Response truncated due to size limit. Use pagination to see more results.*";
}
