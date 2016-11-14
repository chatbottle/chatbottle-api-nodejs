'use strict';

if (!process.env.CHATBOTTLE_API_TOKEN) {
  throw new Error('"CHATBOTTLE_API_TOKEN" environment variable must be defined');
}
if (!process.env.FACEBOOK_VERIFY_TOKEN) {
  throw new Error('"FACEBOOK_VERIFY_TOKEN" environment variable must be defined');
}
if (!process.env.FACEBOOK_PAGE_TOKEN) {
  throw new Error('"FACEBOOK_PAGE_TOKEN" environment variable must be defined');
}

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const chatbottle = require('./chatbottle')(process.env.CHATBOTTLE_API_TOKEN, { debug: true, platform: 'messenger' });

const app = express();
app.use(bodyParser.json());

const webHookPath = '/facebook/receive/';
app.get(webHookPath, (req, res) => {
  if (req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
    return;
  }
  res.send('Validation token is invalid');
});

app.post(webHookPath, (req, res) => {
  chatbottle.log(req.body);
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
          text: `ECHO: ${text}`,
        },
      },
    };

    request(requestData);
  }
  res.sendStatus(200);
});

const port = 4000;
app.listen(port);
console.log('Facebook webhook available at', `http://localhost:${port}${webHookPath}`);
