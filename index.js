/* The Archbot.
 */
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var suggestions = require('./suggestions.json');
var config = require('./config.json');
var token = process.env.SLACK_TOKEN || '';

var rtm = new RtmClient(token);

console.log('Loaded suggestions:');
console.log(suggestions);

// Create wake word patterns.
console.log('Loaded wake words:');
var wake_words = [];
for(word_index in config['wake_words']) {
  var word = config['wake_words'][word_index];
  console.log(' * ' + word);
  var pat = '\\b' + word + '\\b';
  wake_words.push(new RegExp(pat, 'i'));
}

rtm.on(CLIENT_EVENTS.RTM_AUTHENTICATED, function (rtmStartData) {
    console.log('Logged in as ${rtmStartData.self.name} of team ${rtmStartData}.team.name}, but not yet connected to a channel.');
});

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    console.log('Message: ', message);

    for(word_index in wake_words) {
      var pattern = wake_words[word_index];
      if(pattern.exec(message.text)) {
        console.log('I was asked a question: ', message.text);
        var s = Math.floor(Math.random() * (suggestions.length - 1));
        var msg = suggestions[s];
        console.log(msg);
        rtm.sendMessage(msg, message.channel);
      }
    }

    // At-commands
    var me = new RegExp('^<@' + rtm.activeUserId + '>');
    if(message.text.match(me)) {
        if(message.text.match(/reload/)) {
            delete require.cache[require.resolve('./suggestions.json')];
            suggestions = require('./suggestions.json');
            rtm.sendMessage('I read the this into my transactional path.', message.channel);
            console.log(suggestions);
        }
    }
});
