var plugin = require(__dirname + '/../plugins.js');
var Emoji = require('emoji-data');

var action = {
  name: 'emoji',
  description: 'Replace emoji codes with the Unicode emoji.',
  type: 'filter',
  execute: function(text) {
    text = text.replace(/(:\w+:)/g, (function(_this) {
      return function(match, emoji_code) {
        code = match.replace(/:/g, '');
        emoji = Emoji.find_by_short_name(code)[0];
        return Emoji.EmojiChar._unified_to_char(emoji.unified);
      }
    })(this));
    return text;
  }
};

plugin.addAction(action);
