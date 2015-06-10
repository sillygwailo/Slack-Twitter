var S = require('slack-client');
var Twit = require('twitter');
var TwitterText = require('twitter-text');
var U = require('url');

var twitterOptions = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
}

var T = new Twit(twitterOptions);

var slackOptions = {
  token: process.env.SLACK_TOKEN,
  autoReconnect: true,
  autoMark: true,
  post_channel: process.env.SLACK_POST_CHANNEL,
  timeline_channel: process.env.SLACK_TIMELINE_CHANNEL
}

var Cl = new S(slackOptions.token, slackOptions.autoReconnect, slackOptions.autoMark);

var fs = require('fs');

Cl.login();
Cl.on('open', function() {

});

T.stream('user', function(stream) {
  stream.on('data', function(tweet) {
    var channel = Cl.getChannelByName(slackOptions.timeline_channel);
    if (typeof(tweet.retweeted_status) != 'undefined') {
      channel.send('https://twitter.com/' + tweet.retweeted_status.user.screen_name + '/status/' + tweet.retweeted_status.id_str + ' RT by https://twitter.com/' + tweet.user.screen_name);
    }
    else {
      if (typeof(tweet.user) != 'undefined') {
        channel.send('https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str)
      }
    }
    channel = null;
  });
  stream.on('error', function(error) {
    console.log('Twitter stream error: ' + error);
  });
});

Cl.on('star_added', function(event) {
  if (event.item.type == 'message') {
    path = U.parse(event.item.message.attachments[0].author_link).path.split('/');
    T.post('favorites/create', { id: path[3] }, function(error, data, response) {
      if (err) {
        console.log('Error faving tweet: ' + error);
      }
    });
    path = null;
  }
});
Cl.on('star_removed', function(event) {
  if (event.item.type == 'message') {
    path = U.parse(event.item.message.attachments[0].author_link).path.split('/');
    T.post('favorites/destroy', { id: path[3] }, function(error, data, response) {
      if (err) {
        console.log('Error unfaving tweet: ' + error);
      }
    });
    path = null;
  }
});
Cl.on('message', function(message) {
  the_channel = Cl.getChannelByName(slackOptions.post_channel);
  if (message.channel == the_channel.id && (message.subtype != 'message_changed' && message.subtype != 'bot_message' && message.subtype != 'channel_join')) {
    fs.readdir(__dirname + '/plugins', function (error, files) {
      text = message.text;
      files.forEach(function (file) {
        require(__dirname + '/plugins/' + file);
      });
      plugins = require(__dirname + '/plugins.js');
      plugins.actions.forEach(function(action) {
        if (action.type == 'filter') {
          text = action.execute(text);
        }
      });
      if (TwitterText.getTweetLength(text) <= 140) {
        T.post('statuses/update', { status: text }, function(error, data, response) {
          if (error) {
            console.log('Posting tweet error: ' + error);
          }
        });
      }
      else {
        channel = Cl.getChannelByID(message.channel);
        channel.send("The tweet was too long! Character count: " + TwitterText.getTweetLength(message.text));
        channel = null;
      } // If message longer than 140 character
    });
  } // Message type.
});
