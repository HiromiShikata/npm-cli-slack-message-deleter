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

## Example 📖

Here's a quick example to illustrate its usage:
Remove messages older than 10 minutes in the channel `CFNN90G07`

```
npx -y slack-message-deleter -t xoxb-123456789012-123456789012-123456789012-123456789012 -c CFNN90G07 -m 10
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT
