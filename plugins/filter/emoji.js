var filters = require(__dirname + '/../filters.js');
var Emoji = require('emoji-data');

var filter = {
  name: 'emoji',
  description: 'Replace emoji codes with the Unicode emoji.',
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

filters.addFilter(filter);
