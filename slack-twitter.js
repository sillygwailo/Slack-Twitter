var S = require('slack-client');
var Twit = require('twit');
var TwitterText = require('twitter-text');
var U = require('url');

var twitterOptions = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN_KEY,
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
Cl.on('close', function () {
  console.log('Connection closed, retrying...');
  Cl.reconnect();
});

stream = T.stream('user');

stream.on('tweet', function(tweet) {
  var channel = Cl.getChannelByName(slackOptions.timeline_channel);
  if (typeof(tweet.retweeted_status) != 'undefined') {
    channel.send('https://twitter.com/' + tweet.retweeted_status.user.screen_name + '/status/' + tweet.retweeted_status.id_str + ' RT by https://twitter.com/' + tweet.user.screen_name);
    if (typeof(tweet.retweeted_status.quoted_status_id_str) != 'undefined') {
      T.get('/statuses/show/' + tweet.retweeted_status.quoted_status_id_str, {}, function(error, quoted_tweet, response) {
        var channel = Cl.getChannelByName(slackOptions.timeline_channel);
        channel.send('Quoted tweet inside RT: https://twitter.com/' + quoted_tweet.user.screen_name + '/status/' + quoted_tweet.id_str);
      });
    }
  }
  else {
    if (typeof(tweet.user) != 'undefined') {
      channel.send('https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str)
      if (typeof(tweet.quoted_status) != 'undefined') {
        channel.send('Quoted tweet: https://twitter.com/' + tweet.quoted_status.user.screen_name + '/status/' + tweet.quoted_status.id_str);
      }
    }
  }
  channel = null;
});

stream.on('error', function(error) {
  console.log('Twitter stream error: ' + error);
});

Cl.on('star_added', function(event) {
  if (event.item.type == 'message') {
    path = U.parse(event.item.message.attachments[0].author_link).path.split('/');
    T.post('favorites/create', { id: path[3] }, function(error, data, response) {
      if (error) {
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
      if (error) {
        console.log('Error unfaving tweet: ' + error);
      }
    });
    path = null;
  }
});
Cl.on('message', function(message) {
  the_channel = Cl.getChannelByName(slackOptions.post_channel);
  if (message.channel == the_channel.id && (message.subtype != 'message_changed' && message.subtype != 'bot_message' && message.subtype != 'channel_join')) {
    fs.readdir(__dirname + '/plugins/filter', function (error, files) {
      text = message.text;
      files.forEach(function (file) {
        require(__dirname + '/plugins/filter/' + file);
      });
      filters = require(__dirname + '/plugins/filters.js').filters;
      filters.forEach(function(filter) {
        text = filter.execute(text);
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
