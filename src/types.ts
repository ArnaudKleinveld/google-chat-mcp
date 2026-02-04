// Google Chat API type definitions
// Note: Index signatures added for MCP SDK compatibility with structuredContent

export interface Space {
  [key: string]: unknown;
  name: string;
  type?: string;
  spaceType?: string;
  singleUserBotDm?: boolean;
  threaded?: boolean;
  displayName?: string;
  externalUserAllowed?: boolean;
  spaceThreadingState?: string;
  spaceDetails?: SpaceDetails;
  spaceHistoryState?: string;
  importMode?: boolean;
  createTime?: string;
  adminInstalled?: boolean;
  membershipCount?: MembershipCount;
}

export interface SpaceDetails {
  description?: string;
  guidelines?: string;
}

export interface MembershipCount {
  joinedDirectHumanUserCount?: number;
  joinedGroupCount?: number;
}

export interface User {
  name: string;
  displayName?: string;
  domainId?: string;
  type?: string;
  isAnonymous?: boolean;
}

export interface Member {
  [key: string]: unknown;
  name: string;
  state?: string;
  role?: string;
  member?: User;
  groupMember?: GroupMember;
  createTime?: string;
  deleteTime?: string;
}

export interface GroupMember {
  name: string;
}

export interface Message {
  [key: string]: unknown;
  name: string;
  sender?: User;
  createTime?: string;
  lastUpdateTime?: string;
  deleteTime?: string;
  text?: string;
  formattedText?: string;
  cards?: Card[];
  cardsV2?: CardV2[];
  annotations?: Annotation[];
  thread?: Thread;
  space?: Space;
  fallbackText?: string;
  argumentText?: string;
  slashCommand?: SlashCommand;
  attachment?: Attachment[];
  matchedUrl?: MatchedUrl;
  threadReply?: boolean;
  clientAssignedMessageId?: string;
  emojiReactionSummaries?: EmojiReactionSummary[];
  privateMessageViewer?: User;
  deletionMetadata?: DeletionMetadata;
  quotedMessageMetadata?: QuotedMessageMetadata;
}

export interface Thread {
  name: string;
  threadKey?: string;
}

export interface Card {
  header?: CardHeader;
  sections?: CardSection[];
  cardActions?: CardAction[];
  name?: string;
}

export interface CardV2 {
  cardId?: string;
  card?: Card;
}

export interface CardHeader {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageStyle?: string;
}

export interface CardSection {
  header?: string;
  widgets?: Widget[];
  collapsible?: boolean;
  uncollapsibleWidgetsCount?: number;
}

export interface Widget {
  textParagraph?: TextParagraph;
  image?: Image;
  keyValue?: KeyValue;
  buttons?: Button[];
}

export interface TextParagraph {
  text?: string;
}

export interface Image {
  imageUrl?: string;
  onClick?: OnClick;
  aspectRatio?: number;
}

export interface KeyValue {
  topLabel?: string;
  content?: string;
  contentMultiline?: boolean;
  bottomLabel?: string;
  onClick?: OnClick;
  icon?: string;
  iconUrl?: string;
  button?: Button;
}

export interface Button {
  textButton?: TextButton;
  imageButton?: ImageButton;
}

export interface TextButton {
  text?: string;
  onClick?: OnClick;
}

export interface ImageButton {
  icon?: string;
  iconUrl?: string;
  onClick?: OnClick;
}

export interface OnClick {
  action?: FormAction;
  openLink?: OpenLink;
}

export interface FormAction {
  actionMethodName?: string;
  parameters?: ActionParameter[];
}

export interface ActionParameter {
  key?: string;
  value?: string;
}

export interface OpenLink {
  url?: string;
}

export interface CardAction {
  actionLabel?: string;
  onClick?: OnClick;
}

export interface Annotation {
  type?: string;
  startIndex?: number;
  length?: number;
  userMention?: UserMentionMetadata;
  slashCommand?: SlashCommandMetadata;
  richLinkMetadata?: RichLinkMetadata;
}

export interface UserMentionMetadata {
  user?: User;
  type?: string;
}

export interface SlashCommandMetadata {
  bot?: User;
  type?: string;
  commandName?: string;
  commandId?: string;
  triggersDialog?: boolean;
}

export interface RichLinkMetadata {
  uri?: string;
  richLinkType?: string;
}

export interface SlashCommand {
  commandId?: string;
}

export interface Attachment {
  [key: string]: unknown;
  name: string;
  contentName?: string;
  contentType?: string;
  attachmentDataRef?: AttachmentDataRef;
  driveDataRef?: DriveDataRef;
  thumbnailUri?: string;
  downloadUri?: string;
  source?: string;
}

export interface AttachmentDataRef {
  resourceName?: string;
  attachmentUploadToken?: string;
}

export interface DriveDataRef {
  driveFileId?: string;
}

export interface MatchedUrl {
  url?: string;
}

export interface EmojiReactionSummary {
  emoji?: Emoji;
  reactionCount?: number;
}

export interface Emoji {
  unicode?: string;
  customEmoji?: CustomEmoji;
}

export interface CustomEmoji {
  uid?: string;
}

export interface DeletionMetadata {
  deletionType?: string;
}

export interface QuotedMessageMetadata {
  name?: string;
  lastUpdateTime?: string;
}

export interface Reaction {
  [key: string]: unknown;
  name: string;
  user?: User;
  emoji?: Emoji;
}

export interface SpaceEvent {
  name: string;
  eventTime?: string;
  eventType?: string;
  messageCreatedEventData?: MessageEventData;
  messageUpdatedEventData?: MessageEventData;
  messageDeletedEventData?: MessageEventData;
  messageBatchCreatedEventData?: MessageBatchEventData;
  messageBatchUpdatedEventData?: MessageBatchEventData;
  messageBatchDeletedEventData?: MessageBatchEventData;
  spaceUpdatedEventData?: SpaceEventData;
  spaceBatchUpdatedEventData?: SpaceBatchEventData;
  membershipCreatedEventData?: MembershipEventData;
  membershipUpdatedEventData?: MembershipEventData;
  membershipDeletedEventData?: MembershipEventData;
  membershipBatchCreatedEventData?: MembershipBatchEventData;
  membershipBatchUpdatedEventData?: MembershipBatchEventData;
  membershipBatchDeletedEventData?: MembershipBatchEventData;
  reactionCreatedEventData?: ReactionEventData;
  reactionDeletedEventData?: ReactionEventData;
  reactionBatchCreatedEventData?: ReactionBatchEventData;
  reactionBatchDeletedEventData?: ReactionBatchEventData;
}

export interface MessageEventData {
  message?: Message;
}

export interface MessageBatchEventData {
  messages?: Message[];
}

export interface SpaceEventData {
  space?: Space;
}

export interface SpaceBatchEventData {
  spaces?: Space[];
}

export interface MembershipEventData {
  membership?: Member;
}

export interface MembershipBatchEventData {
  memberships?: Member[];
}

export interface ReactionEventData {
  reaction?: Reaction;
}

export interface ReactionBatchEventData {
  reactions?: Reaction[];
}

// API Response types
export interface ListSpacesResponse {
  spaces?: Space[];
  nextPageToken?: string;
}

export interface SearchSpacesResponse {
  spaces?: Space[];
  nextPageToken?: string;
  totalSize?: number;
}

export interface ListMembersResponse {
  memberships?: Member[];
  nextPageToken?: string;
}

export interface ListMessagesResponse {
  messages?: Message[];
  nextPageToken?: string;
}

export interface ListReactionsResponse {
  reactions?: Reaction[];
  nextPageToken?: string;
}

export interface ListSpaceEventsResponse {
  spaceEvents?: SpaceEvent[];
  nextPageToken?: string;
}

// Pagination metadata
export interface PaginationInfo {
  hasMore: boolean;
  nextPageToken?: string;
  totalCount?: number;
}
