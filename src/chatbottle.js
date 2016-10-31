'use strict';

var rp = require('request-promise');
var uuid = require('node-uuid');
var _ = require('lodash');

function ChatBottleClient(token, urlRoot, debug) {
    var that = this;
    that.token = token;
    that.urlRoot = urlRoot;
    that.debug = debug;

    that.logIncoming = function (data) {
        var url = that.urlRoot + token + '/';

        if (that.debug) {
            console.log('POST ' + url);
            console.log(JSON.stringify(data, null, 2));
        }
        rp({
            uri: url,
            method: 'POST',
            json: data
        });
    };

    that.addUsers = function (users) {
        if (!users) {
            throw "users is required"
        }
        if (!users.lenght == 0) {
            throw "list of users is empty"
        }

        for (var i; i < users.lenght; i++) {
            var user = users[i];
            if (!user) {
                throw "users[" + i + "] is null";
            }

            if (!user.id) {
                throw "users[" + i + "].id is required";
            }
        }

        if (!user.attributes && !user.customAttributes && !user.sessions && !user.lastSessionTime) {
            throw "users[" + i + "] is empty. attributes, customAttributes, sessions or lastSessionTime required";
        }

        var url = that.urlRoot + 'bots/' + token + '/users/';

        if (that.debug) {
            console.log('POST ' + url);
            console.log(JSON.stringify(users, null, 2));
        }
        rp({
            uri: url,
            method: 'POST',
            json: data
        });
    };

    that.updateUser = function (userId, data) {
        if (!userId) {
            throw "userId is required"
        }
        if (!data) {
            throw "data is required"
        }

        if (!data.attributes && !data.customAttributes) {
            throw "both data.attributes or data.customAttributes cannot be null"
        }

        var url = that.urlRoot + 'bots/' + token + '/users/' + userId + "/";

        if (that.debug) {
            console.log('PUT ' + url);
            console.log(JSON.stringify(data, null, 2));
        }
        rp({
            uri: url,
            method: 'PUT',
            json: data
        });
    };

    that.deleteUsers = function (userIds) {
        if (!userIds) {
            throw "userIds is required"
        }

        if (userIds.length == 0) {
            throw "userIds is empty"
        }

        var url = that.urlRoot + 'bots/' + token + '/users/' + userIds.join() + "/";

        if (that.debug) {
            console.log('DELETE ' + url);
        }
        rp({
            uri: url,
            method: 'DELETE',
            json: data
        });
    };

    that.deleteUser = function (userId) {
        if (!userId) {
            throw "userId is required"
        }
        that.deleteUsers([userId]);
    };

    that.getUser = function (userId) {
        if (!userId) {
            throw "userId is required"
        }

        var url = that.urlRoot + 'bots/' + token + '/users/' + userId + "/";

        if (that.debug) {
            console.log('GET ' + url);
        }

        var result;
        rp({
            uri: url,
            method: 'GET',
            json: data
        }).then(function (response) {
            result = response;
        });

        return result;
    };

    that.getUsers = function (offset, size) {
        if (!userId) {
            throw "userId is required"
        }

        if (offset < 0) {
            throw "offset cannot be less than 0"
        }

        if (size <= 0) {
            throw "size cannot be less than or equal to 0"
        }

        var url = that.urlRoot + 'bots/' + token + '/users/?';
        if (offset) {
            url += '&offset=' + offset;
        }
        if (offset) {
            url += '&size=' + size;
        }
        if (that.debug) {
            console.log('GET ' + url);
        }

        var result;
        rp({
            uri: url,
            method: 'GET',
            json: data
        }).then(function (response) {
            result = response;
        });

        return result;
    };
}

module.exports = function (chatBottleToken, config) {
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
