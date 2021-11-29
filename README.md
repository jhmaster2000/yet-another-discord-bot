# Yet Another Discord Bot
[![test-badge](https://img.shields.io/badge/Works%20every%20time-60%25%20of%20the%20time-yellow)](#)

~~Because clearly there aren't enough bots out there!~~.

Made with easy and flexible selfhosting in mind. Uses [discord.js](https://discord.js.org/#/) v12 and includes a generic webserver currently not used for anything.

Random Commit Hash: `000001`

## Requirements
- OS: [Windows or Linux](#differences-between-running-on-windows-or-linux)
- NodeJS: `14.x` or above
- NPM: `7.x` or above

## Setup
### Run directly
- Setup `.env` (See: [.env.template](/.env.template))
- Run `npm install && npm start`

### Run with Docker
- Setup `.env` (See: [.env.template](/.env.template))
- Run `docker build -t yet-another-discord-bot .`
- Run `docker run yet-another-discord-bot`

## Differences between running on Windows or Linux
Feature | Windows | Linux
-|-|-
`client.isWin` | `true` | `false`
`sh` command | Very slow to terminate | Normal behavior (Fast)
`shell` command | Very slow overall | Normal behavior (Fast)