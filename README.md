# npm-cli-slack-message-deleter

[![Test](https://github.com/HiromiShikata/npm-cli-slack-message-deleter/actions/workflows/test.yml/badge.svg)](https://github.com/HiromiShikata/npm-cli-slack-message-deleter/actions/workflows/test.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

Welcome to npm-cli-slack-message-deleter

## Usage 🛠️

Here's how you can use npm-cli-slack-message-deleter:
TODO: copy output of `npx -y slack-message-deleter --help`

```
Usage: slack-message-deleter [options]

Clean up old messages in slack channel

Options:
  -t, --token <string>    SlackBotToken
  -c, --channel <string>  ChannelId
  -m, --minutes <number>  DeleteMessagesOlderThanThisNumberOfMinutes
  -h, --help              display help for command
```

## Slack App Setup and Permissions 🔐

To use this tool, you need to set up a Slack app with the appropriate permissions. Follow these steps:

1. Go to the [Slack API website](https://api.slack.com/apps) and create a new app or select an existing one.

2. Navigate to "OAuth & Permissions" in the left sidebar.

3. Scroll down to the "Scopes" section and add the following scopes under "User Token Scopes":
   - `admin`
   - `channels:history`
   - `channels:write`
   - `chat:write`

4. Scroll back to the top and click "Install to Workspace" or "Reinstall to Workspace" to apply the new permissions.

5. After installation, you'll see a "User OAuth Token" generated. This token starts with `xoxp-`.

### Important Notes:

- Use the User OAuth Token (starting with `xoxp-`) in the `-t` or `--token` option when running the tool.
- If your token starts with `xoxb-`, it is a Bot token and not have the necessary permissions to delete messages from other users.
- The user who authorized the token must have the necessary permissions in the Slack workspace to delete messages.
- Be cautious when using these permissions, as they allow for broad access to your Slack workspace.
- Ensure you comply with your organization's policies and Slack's terms of service when using this tool.

## Usage Example

To delete messages older than 10 minutes in the channel `CFNN90G07`:

```bash
npx -y slack-message-deleter -t xoxp-your-user-oauth-token-here -c CFNN90G07 -m 10
```

Replace `xoxp-your-user-oauth-token-here` with your actual User OAuth Token.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT
