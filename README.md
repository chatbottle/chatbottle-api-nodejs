# [ChatBottle](https://chatbottle.co/) API for Node.js

ChatBottle is an engagement platform for your chatbots. 
ChatBottle allows to send personalized notifications to segmented groups of users.

The following platforms are currently supported via the npm package:

* [Facebook Messenger](http://developers.facebook.com)

## Setup Bot

Create a free account at [https://chatbottle.co/](https://chatbottle.co/) and get a ChatBottle token.

chatbottle is available via NPM.

```bash
npm install --save chatbottle-api-nodejs
```

Include chatbottle and create instance for each platform (if you have mor than one).

```javascript
const chatbottleMessenger = require('chatbottle-api-nodejs')(process.env.CHATBOTTLE_API_TOKEN_MESSENGER, { platform: 'messenger' });
const chatbottleLine = require('chatbottle-api-nodejs')(process.env.CHATBOTTLE_API_TOKEN_LINE, { platform: 'line' });
...
```

You can enable debugging in the second parameter `config` if you have problems.

```javascript
//@param config object {
//    platform => messenger, telegram,
//    debug => see every outgoing data,
//    debugRequest => to set the request-promise library to debug
//  }
const chatbottleMessenger = require('chatbottle-api-nodejs')(process.env.CHATBOTTLE_API_TOKEN_MESSENGER, { platform: 'messenger', debug: true, debugRequest: true });
```

Then log whenever your webhook is called.

# Logging

## Messenger

Facebook Messenger is directly supported to send the `req.body` directly to chatbottle if you enable the following events for your webhook:

https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-echo 
https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered 
https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received 
https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read

```javascript
app.post(webHookPath, function (req, res) {
    chatbottleMessenger.log(req.body);
    const messagingEvents = req.body.entry[0].messaging;
    if (messagingEvents.length && messagingEvents[0].message && messagingEvents[0].message.text) {
        const event = req.body.entry[0].messaging[0];
        const sender = event.sender.id;
        const text = event.message.text;
        const requestData = {
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: process.env.FACEBOOK_PAGE_TOKEN },
            method: 'POST',
            json: {
                recipient: { id: sender },
                message: {
                    text: 'ECHO: ' + text
                }
            }
        };
        request(requestData);
    }
    res.sendStatus(200);
});
```

## Generic (Kik, Viber, Line, ...)

For generic bot platforms you have hook in every receiving and sending message.
 
```javascript
// incoming
// lets say the incoming message is `event` (for Line Bot)
chatbottleLine.log({
    id: event.message ? event.message.id : event.timestamp,
    text: event.message.text,
    userId: event.source.userId,
    direction: 'In',
});

// outgoing
// you can listen on every outgoing request with monkey-patching (see below) ;)
chatbottleLine.log({
    id: new Date().getTime(),
    text: message, // if you have rich content, you can build your message on your own and JSON.stringify() it
    userId: to,
    direction: 'Out',
});

```

### Monkey-patching: Track outgoing HTTP(s) requests in NodeJS by @phips28

https://chatbotsmagazine.com/track-outgoing-http-s-requests-in-nodejs-48608553f03c#.mz675gyuf

That is it!

For a complete example see: [facebook-example.js](https://github.com/chatbottle/chatbottle-api)

Register on ChatBottle: [https://chatbottle.co/](https://chatbottle.co/)
