# [ChatBottle](https://chatbottle.co/) - Make better chatbots with ChatBottle

ChatBottle provides analytics and marketing tool for your chatbots

The following platforms are currently supported:

* [Facebook Messenger](http://developers.facebook.com)
* [Telegram](https://core.telegram.org)
* [Slack](http://api.slack.com)


## Setup Facebook

Create a free account at [https://chatbottle.co/](https://chatbottle.co/) and get a ChatBottle token.

chatbottle is available via NPM.

```bash
npm install --save chatbottle
```

Include chatbottle.

```javascript
var chatbottle = require('./chatbottle')(process.env.CHATBOTTLE_API_TOKEN, process.env.CHATBOTTLE_BOTID).facebook;
```

Then log whenever your webhook is called

```javascript
app.post(webHookPath, function (req, res) {
    chatbottle.logIncoming(req.body);
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
        const requestId = chatbottle.logOutgoing(requestData.json);
        request(requestData);
    }
    res.sendStatus(200);
});
```

That is it!

For a complete example see: [facebook-example.js](https://github.com/chatbottle/chatbottle-api)
