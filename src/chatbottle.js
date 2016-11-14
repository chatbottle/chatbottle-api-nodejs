'use strict';

const rp = require('request-promise');
const url = require('url');

function ChatBottleClient(token, urlRoot, config) {
  const that = this;
  that.token = token;
  that.urlRoot = urlRoot;
  that.debug = !!config.debug;
  rp.debug = !!config.debugRequest;
  that.platform = config.platform; // we could set whatever platform identifier we want (e.g. for prepareBody)
  // but only messenger and telegram are eligible for the endpoint
  const platformForRoute = ['messenger', 'telegram'].indexOf(config.platform) > -1 ? `${config.platform}/` : '';
  that.url = `${that.urlRoot}updates/${platformForRoute}${token}/`;

  /**
   * prepares the body depending on the platform
   * @param data json { id (message), text, userId, direction (In/Out) }
   * @returns json object
   */
  function prepareBody(data) {
    if (that.platform === 'messenger') { // //////////////////// MESSENGER ////////////////////////////
      return data;
    } else if (that.platform === 'telegram') { // ////////////// TELEGRAM /////////////////////////////
      if (data.from && !data.data) { // incoming message
        if (data.sticker) { // fallback for sticker
          data.text = data.sticker.emoji;
        }
        return {
          update_id: 123456789, // no internal usage
          message: data,
        };
      } else if (data.from) { // incoming inline button callback
        return {
          update_id: 123456789, // no internal usage
          message: {
            message_id: data.message.message_id,
            from: data.from,
            chat: data.message.chat,
            date: data.message.date,
            text: data.data,
          },
        };
      }
      // outgoing
      if (data.formData) {
        return {
          message_id: 123456789,
          chat: {
            id: data.formData.chat_id,
            type: 'private',
          },
          date: new Date().getTime(),
          text: `${data.formData.caption || ''}\n`
          + `${data.formData.markup || data.formData.reply_markup || ''}\n`
          + `Photo: ${data.formData.photo.value.href}`.trim(),
        };
      }
      const body = url.parse(`?${data.body}`, true).query;
      return {
        message_id: 123456789,
        chat: {
          id: body.chat_id,
          type: 'private',
        },
        date: new Date().getTime(),
        text: `${body.text || ''}\n${body.markup || body.reply_markup || ''}`.trim(),
      };
    }

    return { // //////////////////////////////////////////////// GENERIC //////////////////////////////
      Messaging: [
        {
          Id: data.id,
          Text: typeof data.text === 'object' ? JSON.stringify(data.text) : data.text,
          UserId: data.userId,
          Direction: data.direction,
          Timestamp: new Date().getTime(),
        },
      ],
    };
  }

  function prepareUri(_uri, data) {
    let uri = _uri;
    if (that.platform === 'telegram') {
      if (data.from) {
        uri += '?direction=in';
      } else {
        uri += '?direction=out';
      }
      return uri;
    }
    return uri;
  }

  /**
   * log messages
   * for both, incoming and outgoing
   * @param data
   * @returns Promise response
   */
  that.log = function log(data) {
    // block telegrams setWebhook call
    if (data.href && data.href.indexOf('setWebhook') > -1) {
      return Promise.resolve();
    }

    if (that.debug) {
      console.log(`ChatBottle: log: ${prepareUri(that.url, data)}`);
      console.log('ChatBottle:log.data:', data);
    }

    return rp({
      uri: prepareUri(that.url, data),
      method: 'POST',
      json: prepareBody(data),
    })
      .catch((error) => {
        console.error('ChatBottle:log:request', error);
      });
  };

  /**
   * add users
   * ATTENTION! POST overrides an existing user based on userId. Use it only for importing.
   * https://github.com/chatbottle/chatbottle-api#add-users
   * @param users array
   * @returns Promise
   */
  that.addUsers = function addUsers(users) {
    if (!users) {
      throw new Error('users is required');
    }
    if (users.length === 0) {
      throw new Error('list of users is empty');
    }

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (!user) {
        throw new Error(`users[${i}] is null`);
      }

      if (!user.id) {
        throw new Error(`users[${i}].id is required`);
      }

      if (!user.attributes && !user.customAttributes && !user.sessions && !user.lastSessionTime) {
        throw new Error(`users[${i}] is empty.attributes, customAttributes, sessions or lastSessionTime required`);
      }
    }
    const uri = `${that.urlRoot}bots/${token}/users/`;
    const options = {
      uri,
      method: 'POST',
      json: users,
    };

    return rp(options)
      .catch((error) => {
        console.error('ChatBottle:addUsers', error);
      });
  };

  /**
   * update user
   * https://github.com/chatbottle/chatbottle-api#update-user
   * @param userId
   * @param user object
   * @returns Promise response
   */
  that.updateUser = function updateUser(userId, user) {
    if (!userId) {
      throw new Error('userId is required');
    }
    if (!user) {
      throw new Error('user is required');
    }

    if (!user.attributes && !user.customAttributes) {
      throw new Error('both data.attributes or data.customAttributes cannot be null');
    }

    const uri = `${that.urlRoot}bots/${token}/users/${userId}/`;
    return rp({
      uri,
      method: 'PUT',
      json: user,
    })
      .catch((error) => {
        console.error('ChatBottle:updateUser', error);
      });
  };

  /**
   * delete users
   * https://github.com/chatbottle/chatbottle-api#delete-users
   * @param userIds array
   * @returns Promise response
   */
  that.deleteUsers = function deleteUsers(userIds) {
    if (!userIds) {
      throw new Error('userIds is required');
    }

    if (userIds.length === 0) {
      throw new Error('userIds is empty');
    }

    const uri = `${that.urlRoot}bots/${token}/users/${userIds.join()}/`;
    return rp({
      uri,
      method: 'DELETE',
      json: true,
    })
      .catch((error) => {
        console.error('ChatBottle:deleteUsers', error);
      });
  };

  /**
   * delete user
   * https://github.com/chatbottle/chatbottle-api#delete-users
   * @param userId string
   */
  that.deleteUser = function deleteUser(userId) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return that.deleteUsers([userId]);
  };

  /**
   * get user
   * @param userId string
   * https://github.com/chatbottle/chatbottle-api#delete-users
   * @returns Promise response
   */
  that.getUser = function getUser(userId) {
    if (!userId) {
      throw new Error('userId is required');
    }

    const uri = `${that.urlRoot}bots/${token}/users/${userId}/`;
    return rp({
      uri,
      method: 'GET',
      json: true,
    })
      .catch((error) => {
        console.error('ChatBottle:getUser', error);
      });
  };

  /**
   * get users
   * https://github.com/chatbottle/chatbottle-api#list-users
   * @param _offset int
   * @param _size int
   * @returns Promise response
   */
  that.getUsers = function getUsers(_offset, _size) {
    const offset = _offset || 0;
    const size = _size || 10;
    if (offset < 0) {
      throw new Error('offset cannot be less than 0');
    }

    if (size <= 0) {
      throw new Error('size cannot be less than or equal to 0');
    }

    let uri = `${that.urlRoot}bots/${token}/users/?`;
    if (offset) {
      uri += `&offset=${offset}`;
    }
    if (size) {
      uri += `&size=${size}`;
    }
    return rp({
      uri,
      method: 'GET',
      json: true,
    })
      .catch((error) => {
        console.error('ChatBottle:getUsers', error);
      });
  };
}

/**
 * @param chatBottleToken
 * @param config object {
 * platform => messenger, telegram,
 * debug => see every outgoing data,
 * debugRequest => to set the request-promise library to debug
 * }
 * @returns {ChatBottleClient}
 */
module.exports = function ChatBottle(chatBottleToken, config) {
  if (!chatBottleToken) {
    throw new Error('YOU MUST SUPPLY A CHATBOTTLE TOKEN TO CHATBOTTLE!');
  }
  const uri = 'https://api.chatbottle.co/v2/';
  return new ChatBottleClient(chatBottleToken, uri, config || {});
};
