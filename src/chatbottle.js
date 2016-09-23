'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');
var _ = require('lodash');

var VERSION = '1';

function ChatBottleClient(token, urlRoot, debug) {
    var that = this;
    that.token = token;
    that.urlRoot = urlRoot;
    that.debug = debug;

    that.logIncoming = function (data) {
        var url = that.urlRoot + token + '/?' + 'direction=in';

        if (that.debug) {
            console.log('ChatBottle In: ' + url);
            console.log(JSON.stringify(data, null, 2));
        }
        rp({
            uri: url,
            method: 'POST',
            json: data
        });
    };

    that.logOutgoing = function (data) {
        var url = that.urlRoot + token + '/?' + 'direction=out';

        if (that.debug) {
            console.log('ChatBottle Out: ' + url);
            console.log(JSON.stringify(data, null, 2));
        }
        data = _.clone(data);
        data.requestId = uuid.v4();
        rp({
            uri: url,
            method: 'POST',
            json: data
        });
        return data.requestId;
    };
}

module.exports = function (chatBottleToken, botId, config) {
    if (!chatBottleToken) {
        throw new Error('YOU MUST SUPPLY A CHATBOTTLE TOKEN TO CHATBOTTLE!');
    }
    var url = 'https://api.chatbottle.co/v2/updates/';
    var debug = false;
    if (config) {
        debug = config.debug;
    }
    return {
        facebook: new ChatBottleClient(chatBottleToken, url + 'messenger/', debug),
        generic: new ChatBottleClient(chatBottleToken, url, debug) 
    };
};
