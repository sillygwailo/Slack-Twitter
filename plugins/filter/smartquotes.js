var filters = require(__dirname + '/../filters.js');

var filter = {
  name: 'smartquotes',
  description: 'Replace quotes with smartquotes.',
  type: 'filter',
  execute: function(text) {
    // Smart Quotes: http://www.leancrew.com/all-this/2010/11/smart-quotes-in-javascript/
    text = text.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
    text = text.replace(/'/g, "\u2019");                            // closing singles & apostrophes
    text = text.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
    text = text.replace(/"/g, "\u201d");                            // closing doubles
    text = text.replace(/--/g, "\u2014");                           // em-dashes
    return text; 
  }
};

filters.addFilter(filter);