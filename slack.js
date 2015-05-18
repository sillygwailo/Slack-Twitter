module.exports = {
  token: process.env.SLACK_TOKEN,
  autoReconnect: true,
  autoMark: true,
  post_channel: process.env.SLACK_POST_CHANNEL,
  timeline_channel: process.env.SLACK_TIMELINE_CHANNEL
}
