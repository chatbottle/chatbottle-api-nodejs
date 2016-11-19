'use strict';

if (!process.env.CHATBOTTLE_API_TOKEN) {
  throw new Error('"CHATBOTTLE_API_TOKEN" environment variable must be defined');
}

const chatbottle = require('./chatbottle')(process.env.CHATBOTTLE_API_TOKEN, { debug: true, platform: 'messenger' });

// 0. Define users to add
const user = {
  id: 'import-example-id-116',
  sessions: 71,
  lastSession: new Date(),
  attributes: {
    firstName: 'John',
    lastName: 'Doe',
    gender: 1,
    timezone: -8,
    locale: 'en-US',
    profilePic: 'https://lh4.googleusercontent.com/-62fqwmOS7-U/AAAAAAAAAAI/AAAAAAAAHbo/BffLhPbHB5k/photo.jpg?sz=50'
  },
  customAttributes: {
    myCustomField: 'field value',
    age: 29,
    isImported: true,
    email: 'john@chatbottle.co',
    tags: [
      'visitor',
      'prospect',
    ],
  },
};
const users = [user];

// 1. add new users
chatbottle.addUsers(users)
  .then((response) => {
    console.log('addUsers', response);
  })
  .then(() => {
    // 2. just get added user
    return chatbottle.getUser(user.id);
  })
  .then((response) => {
    console.log('getUser', response);
  })
  .then(() => {
    // 3. update user
    user.attributes.timezone = 2;
    user.customAttributes.tags = [
      'visitor',
      'prospect',
      'customer',
    ];
    user.customAttributes.ip = '216.239.32.0';
    return chatbottle.updateUser(user.id, user);
  })
  .then((response) => {
    console.log('updateUser', response);
  })
  .then(() => {
    // 4. get all users
    const offset = 0;
    const size = 200;
    return chatbottle.getUsers(offset, size);
  })
  .then((response) => {
    console.log('getUsers', response);
  })
  .then(() => {
    // 5. delete the added user
    return chatbottle.deleteUser(user.id);
  })
  .then((response) => {
    console.log('deleteUser', response);
  })
  .then(() => {
    // 6. get all users. the list is empty since the only existing user just deleted
    const offset = 0;
    const size = 200;
    return chatbottle.getUsers(offset, size);
  })
  .then((response) => {
    console.log('getUsers', response);
  });
