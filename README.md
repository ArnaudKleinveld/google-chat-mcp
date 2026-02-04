# Google Chat MCP Server

An MCP (Model Context Protocol) server that provides tools to interact with the Google Chat API. This enables LLMs to manage spaces, messages, members, reactions, and attachments in Google Chat.

## Features

- **Spaces**: List, create, update, delete, and search spaces
- **Messages**: Send, read, update, and delete messages
- **Members**: Manage space membership
- **Reactions**: Add and remove emoji reactions
- **Attachments**: Get attachment metadata and upload files

## Installation

```bash
npm install
npm run build
```

## Authentication

The server supports three authentication methods. Set one of the following environment variables:

### Service Account (Recommended for apps)

```bash
# Option 1: Path to service account JSON file
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Option 2: Service account JSON as a string
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

### OAuth2 Token (For user authentication)

```bash
export GOOGLE_OAUTH_TOKEN=ya29.your-access-token
```

## Setting Up Google Cloud

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Chat API
4. Create a service account or OAuth2 credentials
5. Grant the necessary Chat API scopes

### Required Scopes

- `https://www.googleapis.com/auth/chat.spaces`
- `https://www.googleapis.com/auth/chat.messages`
- `https://www.googleapis.com/auth/chat.memberships`

## Usage

### stdio Mode (Default)

Run as a subprocess for local integrations:

```bash
npm start
```

### HTTP Mode

Run as a web service:

```bash
TRANSPORT=http PORT=3000 npm start
```

## Available Tools

### Spaces

| Tool | Description |
|------|-------------|
| `google_chat_list_spaces` | List spaces the user/app is a member of |
| `google_chat_get_space` | Get details about a specific space |
| `google_chat_create_space` | Create a new space |
| `google_chat_update_space` | Update space settings |
| `google_chat_delete_space` | Delete a space |
| `google_chat_search_spaces` | Search for spaces in the organization |
| `google_chat_find_direct_message` | Find DM space with a specific user |

### Messages

| Tool | Description |
|------|-------------|
| `google_chat_list_messages` | List messages in a space |
| `google_chat_get_message` | Get details about a specific message |
| `google_chat_create_message` | Send a message to a space |
| `google_chat_update_message` | Update a message |
| `google_chat_delete_message` | Delete a message |

### Members

| Tool | Description |
|------|-------------|
| `google_chat_list_members` | List members of a space |
| `google_chat_get_member` | Get membership details |
| `google_chat_create_member` | Add a member to a space |
| `google_chat_delete_member` | Remove a member from a space |

### Reactions

| Tool | Description |
|------|-------------|
| `google_chat_list_reactions` | List reactions on a message |
| `google_chat_create_reaction` | Add a reaction to a message |
| `google_chat_delete_reaction` | Remove a reaction |

### Attachments

| Tool | Description |
|------|-------------|
| `google_chat_get_attachment` | Get attachment metadata |
| `google_chat_upload_attachment` | Upload an attachment |

## Response Formats

All tools support two output formats:

- **markdown** (default): Human-readable formatted text
- **json**: Structured data for programmatic processing

## Example Usage with Claude

```
User: List my Google Chat spaces

Claude: [Uses google_chat_list_spaces tool]

Here are your Google Chat spaces:

## Engineering Team
- **ID**: `spaces/AAAA1234`
- **Type**: SPACE

## Project X Discussion
- **ID**: `spaces/BBBB5678`
- **Type**: SPACE
```

## Error Handling

The server provides clear, actionable error messages:

- **401**: Authentication failed - check credentials
- **403**: Permission denied - check API scopes
- **404**: Resource not found - verify the resource name
- **429**: Rate limit exceeded - wait before retrying

## Configuration for Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "google-chat": {
      "command": "node",
      "args": ["/path/to/google-chat-mcp/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json"
      }
    }
  }
}
```

## License

MIT
