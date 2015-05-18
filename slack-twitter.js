var S = require('slack-client');
var Twit = require('twitter');
var TwitterText = require('twitter-text');
var U = require('url');

var options = {
}

var T = new Twit(require(__dirname + '/twitter.js'));

var slackOptions = require(__dirname + '/slack.js');

var Cl = new S(slackOptions.token, slackOptions.autoReconnect, slackOptions.autoMark);

var removeFormatting = function(text) {
    // function from https://raw.githubusercontent.com/slackhq/hubot-slack/master/src/slack.coffee compiled to JavaScript
    // this, among other things, removes angle brackets from URLs that the Slack API passes over to this client
    text = text.replace(/<([@#!])?([^>|]+)(?:\|([^>]+))?>/g, (function(_this) {
        return function(m, type, link, label) {
            var channel, user;
            switch (type) {
            case '@':
                if (label) {
                    return label;
                }
                user = Cl.getUserByID(link);
                if (user) {
                    return "@" + user.name;
                }
                break;
            case '#':
                if (label) {
                    return label;
                }
                channel = Cl.getChannelByID(link);
                if (channel) {
                    return "\#" + channel.name;
                }
                break;
            case '!':
                if (link === 'channel' || link === 'group' || link === 'everyone') {
                    return "@" + link;
                }
                break;
            default:
                link = link.replace(/^mailto:/, '');
                if (label && -1 === link.indexOf(label)) {
                    return "" + label + " (" + link + ")";
                } else {
                    return link;
                }
            }
        };
    })(this));
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&amp;/g, '&');
    // Smart Quotes: http://www.leancrew.com/all-this/2010/11/smart-quotes-in-javascript/
    text = text.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
    text = text.replace(/'/g, "\u2019");                            // closing singles & apostrophes
    text = text.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
    text = text.replace(/"/g, "\u201d");                            // closing doubles
    text = text.replace(/--/g, "\u2014");                           // em-dashes
    return text;
};


Cl.login();
Cl.on('open', function() {

});

T.stream('user', function(stream) {
  stream.on('data', function(tweet) {
    channel = Cl.getChannelByName(slackOptions.timeline_channel);
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
    console.log(error);
  });
});

Cl.on('star_added', function(event) {
  if (event.item.type == 'message') {
    path = U.parse(event.item.message.attachments[0].author_link).path.split('/');
    T.post('favorites/create', { id: path[3] }, function(err, data, response) {
      console.log(err);
    });
    path = null;
  }
});
Cl.on('star_removed', function(event) {
  if (event.item.type == 'message') {
    path = U.parse(event.item.message.attachments[0].author_link).path.split('/');
    T.post('favorites/destroy', { id: path[3] }, function(err, data, response) {
      console.log(err);
    });
    path = null;
  }
});
Cl.on('message', function(message) {
  console.log(message);
  the_channel = Cl.getChannelByName(slackOptions.post_channel);
  if (message.channel == the_channel.id && (message.subtype != 'message_changed' && message.subtype != 'bot_message')) {
    if (TwitterText.getTweetLength(message.text) <= 140) {
      T.post('statuses/update', { status:removeFormatting(message.text) }, function(err, data, response) {
      });
    }
    else {
      channel = Cl.getChannelByID(message.channel);
      channel.send("The tweet was too long! Character count: " + TwitterText.getTweetLength(message.text));
      channel = null;
    } // If message longer than 140 character
  } // Message type.
});
