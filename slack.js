module.exports = {
  token: process.env.SLACK_TOKEN,
  autoReconnect: true,
  autoMark: true,
  channel: process.env.SLACK_CHANNEL
}
