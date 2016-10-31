'use strict';
var rp = require('request-promise');
//var uuid = require('node-uuid');
//var _ = require('lodash');

function updatesClient(token, urlRoot) {
    var that = this;
    that.token = token;
    that.urlRoot = urlRoot;
    that.facebook = function () {
        var self = this;
        self.logIncoming = function (data) {
            var url = that.urlRoot + 'updates/' + token + '/';
            rp({
                uri: url,
                method: 'POST',
                json: data
            });
        };
    };
}

function ChatBottleClient(token, urlRoot, debug) {
    var that = this;
    that.token = token;
    that.urlRoot = urlRoot;
    rp.debug = true;

    that.facebook = new updatesClient(token, urlRoot + 'messenger/');
    that.telegram = new updatesClient(token, urlRoot + 'telegram/');
    that.generic = new updatesClient(token, urlRoot);

    that.addUsers = function (users) {
        if (!users) {
            throw "users is required"
        }
        if (users.length == 0) {
            throw "list of users is empty"
        }

        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (!user) {
                throw "users[" + i + "] is null";
            }

            if (!user.id) {
                throw "users[" + i + "].id is required";
            }

            if (!user.attributes && !user.customAttributes && !user.sessions && !user.lastSessionTime) {
                throw "users[" + i + "] is empty. attributes, customAttributes, sessions or lastSessionTime required";
            }
        }
        var uri = that.urlRoot + 'bots/' + token + '/users/';
        var options = {
            method: 'POST',
            uri: uri,
            body: users,
            json: true 
        };

        rp(options)
            .then(function (parsedBody) {
                // POST succeeded...
            })
            .catch(function (err) {
                // POST failed...
            });
    };

    that.updateUser = function (userId, user) {
        if (!userId) {
            throw "userId is required"
        }
        if (!user) {
            throw "user is required"
        }

        if (!user.attributes && !user.customAttributes) {
            throw "both data.attributes or data.customAttributes cannot be null"
        }

        var url = that.urlRoot + 'bots/' + token + '/users/' + userId + "/";

        rp({
            uri: url,
            method: 'PUT',
            json: user
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

        rp({
            uri: url,
            method: 'DELETE'
        });
    };

    that.deleteUser = function (userId) {
        if (!userId) {
            throw "userId is required"
        }
        that.deleteUsers([userId]);
    };

    that.getUser = function (userId, callback) {
        if (!userId) {
            throw "userId is required"
        }

        var url = that.urlRoot + 'bots/' + token + '/users/' + userId + "/";

        var result;
        rp(url,{
            method: 'GET'
        }, null, callback);

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
        var result;
        rp({
            uri: url,
            method: 'GET'
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
    var url = 'https://api.chatbottle.co/v2/';
    var debug = false;
    if (config) {
        debug = config.debug;
    }
    return new ChatBottleClient(chatBottleToken, url, debug);
};
