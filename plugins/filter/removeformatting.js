var filters = require(__dirname + '/../filters.js');

filter = {
  name: 'removeformatting',
  description: 'Use Slack\'s own alorithm to remove formatting from a message',
  type: 'filter',
  execute: function(text) {
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
      })(this));;        
    return text;
  }
}

filters.addFilter(filter);