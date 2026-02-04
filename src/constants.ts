// Google Chat API constants
export const API_BASE_URL = "https://chat.googleapis.com/v1";
export const CHARACTER_LIMIT = 25000;
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

// Response format enum
export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json"
}

// Space types
export enum SpaceType {
  SPACE = "SPACE",
  GROUP_CHAT = "GROUP_CHAT",
  DIRECT_MESSAGE = "DIRECT_MESSAGE"
}

// Message state
export enum MessageState {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED"
}

// Membership state
export enum MembershipState {
  JOINED = "JOINED",
  INVITED = "INVITED",
  NOT_A_MEMBER = "NOT_A_MEMBER"
}

// Membership role
export enum MembershipRole {
  ROLE_UNSPECIFIED = "ROLE_UNSPECIFIED",
  ROLE_MEMBER = "ROLE_MEMBER",
  ROLE_MANAGER = "ROLE_MANAGER"
}
