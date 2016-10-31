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
var chatbottle = require('./chatbottle')(process.env.CHATBOTTLE_API_TOKEN,
    { debug: true });
//0. Define users to add
var user = {
    id: "import-example-id-116",
    sessions: 71,
    lastSessionTime: 1473861623047,
    attributes: {
        firstName: "John",
        lastName: "Doe",
        gender: 1,
        timezone: -8,
        locale: "en-US",
        profilePic: "https://lh4.googleusercontent.com/-62fqwmOS7-U/AAAAAAAAAAI/AAAAAAAAHbo/BffLhPbHB5k/photo.jpg?sz=50"
    },
    customAttributes: {
        myCustomField: "field value",
        age: 29,
        isImported: true,
        email: "john@chatbottle.co",
        tags: [
            "visitor",
            "prospect"
        ]
    }
};
var users = [user];

//1. add new users 
chatbottle.addUsers(users);

//2. get just added user

chatbottle.getUser(user.id, function (response) {
    console.log(JSON.stringify(response, null, 2));
});

user.attributes.timezone = 2;
user.customAttributes.tags = [
    "visitor",
    "prospect",
    "customer"
];
user.customAttributes.ip = "216.239.32.0";
chatbottle.updateUser(user.id, user);

//3. get all users
var offset = 0;
var size = 200;
var allServerUsers = chatbottle.getUsers(offset, size);
console.log(JSON.stringify(allServerUsers, null, 2));

//4. delete the added user
chatbottle.delete(user.id);

//5. get all users. the list is empty since the only existing user just deleted
var allServerUsers = chatbottle.getUsers(offset, size);
console.log(JSON.stringify(allServerUsers, null, 2));



