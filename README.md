Installation
====

1. Create a channel Slack channel. Name it something obvious like 'twitter'.
2. Get a Slack bot account. Visit https://my.slack.com/services/new and under "DIY Integrations & Customizations" click the "Add" button. Once you create this bot (name it something obvious like "twitter_bot") you will get an API token.
2. Invite the bot to the channel you created in Step #1. To do that, go to the #general channel where the bot is initially invited to. Click their avatar, and then "Invite to a channel...".
3. Associate a Twitter account with your Slack team. This is necessary so that Slack will unfurl the tweets, that is, it will show tweet text (and images that people tweet) from this account's timeline. Visit https://my.slack.com/services and then the "Authentications" tab to set this up.
4. Login to the Twitter website Application Management website at https://apps.twitter.com/ with the Twitter account that you want to post tweets to from Slack. (It can be a different Twitter account than the one in step #3.) Click "Create New App". Make sure to give it read and write permissions.
5. Set your environment variables. See the section below.
6. Start the bot! Use [PM2](https://github.com/Unitech/pm2) or [forever](https://github.com/foreverjs/forever) or something that will daemonize the bot.

Or you could deploy it to Heroku by clicking the button:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/sillygwailo/Slack-Twitter)

**You still need to follow steps #1-4 in the above instructions before clicking the button.**

Warning: All messages under 140 characters will get posted to Twitter. Only use a channel designated to post tweets from.

Environment Variables
====

This bot uses environment variables to store tokens.

    export SLACK_CHANNEL=yourSlackChannelHere
    export SLACK_TOKEN=yourSlackTokenHere
    export TWITTER_CONSUMER_KEY=yourTwitterConsumerKeyHere
    export TWITTER_CONSUMER_SECRET=yourTwitterConsumerSecretHere
    export TWITTER_ACCESS_TOKEN_KEY=yourTwitterAccessTokenKeyHere
    export TWITTER_ACCESS_TOKEN_SECRET=yourTwitterAccessTokenSecretHere

If you're deploying to Heroku, use the following:

    heroku config:set SLACK_CHANNEL=yourSlackChannelHere
    heroku config:set SLACK_TOKEN=yourSlackTokenHere
    heroku config:set TWITTER_CONSUMER_KEY=yourTwitterConsumerKeyHere
    heroku config:set TWITTER_CONSUMER_SECRET=yourTwitterConsumerSecretHere 
    heroku config:set TWITTER_ACCESS_TOKEN_KEY=yourTwitterAccessTokenKeyHere
    heroku config:set TWITTER_ACCESS_TOKEN_SECRET=yourTwitterAccessTokenSecretHere

Usage
====

1. Posting messages to the channel will evaluate whether the tweet meets Twitter's definition of 140 characters. That means that URLs are compressed down (and possibly up?) to be either 23 or 24 characters in length. You don't have to short URLs. (You don't have to in general either, not even for analytics, since http://analytics.twitter.com/ handles that now.)
2. Faving and unfaving. Starring a tweet in Slack will fave that tweet on Twitter. Unstarring it will unfave it.
3. Retweets are handled by taking the URL of the retweeted tweet and saying who it was retweeted by.
4. No replies or retweeting is currently possible. Use a client for that. On the Slack mobile app, you can specify which Twitter app to use. If you know what you're doing with Automator on Mac OS X, you can add [a service to open a URL in Tweetbot](https://github.com/sillygwailo/Open-URL-in-Tweetbot.workflow)

Known Issues
====

* A memory leak. You may have to manually restart the Node.js bot if tweets stop appearing or tweets no longer get sent from your Slack channel.
* Starring a retweet does not currently work.
* This relies on a fork of Slack's official Node.js API client, only to add starring and unstarring events. Pull request forthcoming.