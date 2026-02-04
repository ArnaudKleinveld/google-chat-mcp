# Google Chat API: Service Account Setup

Instructions for the Google Workspace admin to create a service account for the Google Chat API integration.

The service account will act as its own Chat app identity (not impersonating any user). It can access spaces it has been explicitly added to.

---

## Step 1: Create or select a Google Cloud project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page
3. Either select an existing project or click **New Project**
   - If creating new: name it something like `google-chat-integration`, then click **Create**
4. Make sure the project is selected in the dropdown

## Step 2: Enable the Google Chat API

1. Go to **APIs & Services > Library** (or search "Google Chat API" in the top search bar)
2. Find **Google Chat API** and click on it
3. Click **Enable**

## Step 3: Configure the Google Chat app

This is required for service account authentication with the Chat API.

1. In the Google Cloud Console, go to **APIs & Services > Enabled APIs & services**
2. Click on **Google Chat API**
3. Go to the **Configuration** tab
4. Fill in the required fields:
   - **App name**: `Chat MCP Integration` (or whatever you prefer)
   - **Avatar URL**: can be left blank or use any image URL
   - **Description**: `MCP server integration for Google Chat`
   - **Enable Interactive features**: toggle ON
   - Under connection settings, select **App URL** and enter a placeholder like `https://localhost` (the service account calls the API directly, so this URL won't be used)
   - **Visibility**: select **Make this Chat app available to specific people and groups in [your domain]** and add the users who need access
5. Click **Save**

## Step 4: Create a service account

1. Go to **IAM & Admin > Service Accounts**
2. Click **+ Create Service Account**
3. Fill in:
   - **Service account name**: `chat-mcp` (or similar)
   - **Description**: `Service account for Google Chat MCP integration`
4. Click **Create and Continue**
5. For the role, you can skip this step (click **Continue**) — the Chat API uses OAuth scopes, not IAM roles
6. Click **Done**

## Step 5: Create and download the key

1. In the service accounts list, click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key > Create new key**
4. Select **JSON** format
5. Click **Create** — this downloads a `.json` file
6. Send this JSON file securely (it contains credentials — do not share it over unencrypted channels)

---

## What we need back

- The **service account JSON key file** from Step 5

## How the key will be used

The JSON key file is provided to the MCP server via an environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

The server authenticates with the following OAuth scopes:

- `https://www.googleapis.com/auth/chat.spaces`
- `https://www.googleapis.com/auth/chat.spaces.readonly`
- `https://www.googleapis.com/auth/chat.messages`
- `https://www.googleapis.com/auth/chat.messages.readonly`
- `https://www.googleapis.com/auth/chat.memberships`
- `https://www.googleapis.com/auth/chat.memberships.readonly`
- `https://www.googleapis.com/auth/chat.spaces.create`
- `https://www.googleapis.com/auth/chat.delete`
- `https://www.googleapis.com/auth/chat.import`

## Important note

Since the service account acts as the Chat app itself (not as a user), it can only access spaces where the app has been explicitly added as a member. Users will need to add the Chat app to any space they want the integration to interact with.
