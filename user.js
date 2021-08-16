'use strict';


// const uuid = require('uuid');
const AWS = require('aws-sdk');
var admin = require("firebase-admin");
var serviceAccount = require("./google-services.json");
console.log(serviceAccount)
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
module.exports.admin = admin

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.put = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);
    const name = requestBody.name
    const profileImgUrl = requestBody.profileImgUrl || 'https://reqres.in/img/faces/4-image.jpg'
    const phone = requestBody.phone;
    const email = requestBody.email;
    const role = requestBody.role || '';
    const location = requestBody.location || '';
    const password = requestBody.password || '';
    const carsAvailable = requestBody.carsAvailable || 0;
    const carsBooked = requestBody.carsBooked || 0;
    const carsDetails = requestBody.carsDetails || {};
    const bookingsCount = requestBody.bookingsCount || 0
    const avgRating = requestBody.avgRating || 0
    const approvalStatus = requestBody.approvalStatus || 'notApproved'
    const images = requestBody.images || {}
    const notifications = requestBody.notifications || {}
    const deviceToken = requestBody.deviceToken || ''
    const balance = requestBody.balance || {}

    if (typeof carsBooked !== 'number' || typeof bookingsCount !== 'number' || typeof avgRating !== 'number' || typeof role !== 'string' || typeof location !== 'string' || typeof carsAvailable !== 'number' || typeof carsDetails !== 'object' || typeof name !== 'string' || typeof profileImgUrl !== 'string' || typeof phone !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Couldn\'t submit user because of validation errors.'));
        return;
    }

    submitUser(userInfo(name, profileImgUrl, phone, email, password, carsAvailable, carsDetails, role, location, bookingsCount, avgRating, carsBooked, approvalStatus, images, notifications, deviceToken, balance))
        .then(res => {
            callback(null, {
                statusCode: 200, headers: {
                    "Access-Control-Allow-Origin": "*"
                },

                body: JSON.stringify({
                    message: `Successfully submitted user with phone ${phone}`,
                    userId: res.phone
                })
            });
        })
        .catch(err => {
            console.log(err);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Unable to submit user with email ${email}`
                })
            })
        });
};


const submitUser = user => {
    console.log('Submitting user');
    const userInfo = {
        TableName: process.env.USER_TABLE,
        Item: user,
    };
    return dynamoDb.put(userInfo).promise()
        .then(res => user);
};

const userInfo = (name, profileImgUrl, phone, email, password, carsAvailable, carsDetails, role, location, bookingsCount, avgRating, carsBooked, approvalStatus, images, notifications, deviceToken, balance) => {
    const timestamp = new Date().getTime();
    return {
        // id: uuid.v1(),
        name: name,
        profileImgUrl: profileImgUrl,
        email: email,
        phone: phone,
        password: password,
        submittedAt: timestamp,
        updatedAt: timestamp,
        carsAvailable: carsAvailable,
        carsBooked: carsBooked,
        carsDetails: carsDetails,
        role: role,
        location: location,
        bookingsCount: bookingsCount,
        avgRating: avgRating,
        approvalStatus: approvalStatus,
        userId: phone,
        images: images,
        notifications: notifications,
        deviceToken: deviceToken,
        balance: balance
    };
};

module.exports.list = (event, context, callback) => {
    var params = {
        TableName: process.env.USER_TABLE,
        // ProjectionExpression: "firstName,lastName,profileImgUrl, email, phone, password,carsAvailable,carsDetails,carsBooked"
    };

    console.log("Scanning User table.");
    const onScan = (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                body: JSON.stringify({
                    users: data.Items
                })
            });
        }

    };

    dynamoDb.scan(params, onScan);

};

module.exports.get = (event, context, callback) => {
    const params = {
        TableName: process.env.USER_TABLE,
        Key: {
            phone: event.pathParameters.phone,
        },
    };

    dynamoDb.get(params).promise()
        .then(result => {
            const response = {
                statusCode: 200, headers: {
                    "Access-Control-Allow-Origin": "*"
                },

                body: JSON.stringify(result.Item),
            };
            callback(null, response);
        })
        .catch(error => {
            console.error(error);
            callback(new Error('Couldn\'t fetch user.'));
            return;
        });
};


module.exports.listByLocation = (event, context, callback) => {
    console.log(event.pathParameters)
    var params = {
        TableName: process.env.USER_TABLE,
        // ProjectionExpression: "carPlate,linkedUserId,carManufactureYear,carDetails",
        FilterExpression: '#location = :location',
        ExpressionAttributeValues: {
            ':location': event.pathParameters.location
        },
        ExpressionAttributeNames: {
            '#location': 'location',
        },

    };


    console.log("Scanning user table.");
    const onScan = (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200, headers: {
                    "Access-Control-Allow-Origin": "*"
                },

                body: JSON.stringify({
                    users: data.Items
                })
            });
        }

    };

    dynamoDb.scan(params, onScan);
};

module.exports.addNotificationByLocation = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);


    const location = requestBody.location
    const details = requestBody.details

    submitNotificationByLocation({location, details}).then(() => {

        return callback(null, {
            statusCode: 200, headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                requestBody: requestBody
            })
        });

    }).catch((e) => {
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                message: `Unable to submit notification`,
                error: e
            })
        })
    })

};


const submitNotificationByLocation = async locationDetails => {

    console.log('Submitting notification');
    var params = {
        TableName: process.env.USER_TABLE,
        // FilterExpression: '#location = :location',
        // ExpressionAttributeValues: {
        //    ':location': locationDetails.location
        // },
        // ExpressionAttributeNames: {
        //    '#location': 'location',
        // },

    };

    async function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            const timestamp = new Date().getTime();

            // print all the movies
            console.log("Scan succeeded.");
            for (const item of data.Items) {
                console.log('processing item')

                console.log(item)
                const lowerCaseLocation = item.location.toLowerCase()
                const notificationLocation = locationDetails.location.toLowerCase();
                if (lowerCaseLocation.includes(notificationLocation)) {
                    let notifications = item.notifications;
                    notifications[timestamp] = locationDetails;
                    item['notifications'] = notifications;
                    const userInfo = {
                        TableName: process.env.USER_TABLE,
                        Item: item,
                    };
                    await dynamoDb.put(userInfo).promise()
                    console.log('notification added')
                }
            }

            // continue scanning if we have more movies, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                dynamoDb.scan(params, onScan);
            }
        }
    }

    dynamoDb.scan(params, onScan);
};


module.exports.addNotificationPush = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);


    const message = requestBody.message

    submitNotificationPush({message}).then(() => {

        return callback(null, {
            statusCode: 200, headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                requestBody: requestBody
            })
        });

    }).catch((e) => {
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                message: `Unable to submit notification`,
                error: e
            })
        })
    })

};


const submitNotificationPush = async Details => {

    console.log('Submitting notification');
    var params = {
        TableName: process.env.USER_TABLE,
        // FilterExpression: '#location = :location',
        // ExpressionAttributeValues: {
        //    ':location': locationDetails.location
        // },
        // ExpressionAttributeNames: {
        //    '#location': 'location',
        // },

    };

    async function onScan(err, data) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // const timestamp = new Date().getTime();

            // print all the movies
            console.log("Scan succeeded.");
            for (const item of data.Items) {
                console.log('processing item')

                console.log(item)
                const options = notification_options
                if (item['deviceToken']) {
                    admin.messaging().sendToDevice(item['deviceToken'], Details.message, options)
                        .then(response => {
                           console.log(response)
                        })
                        .catch(error => {
                            console.log(error);
                        });
                }
                // const lowerCaseLocation = item.location.toLowerCase()
                // const notificationLocation = locationDetails.location.toLowerCase();
                // if (lowerCaseLocation.includes(notificationLocation)) {
                //    let notifications = item.notifications;
                //    notifications[timestamp] = locationDetails;
                //    item['notifications'] = notifications;
                //    const userInfo = {
                //       TableName: process.env.USER_TABLE,
                //       Item: item,
                //    };
                //    await dynamoDb.put(userInfo).promise()
                //    console.log('notification added')
                // }
            }

            // continue scanning if we have more movies, because
            // scan can retrieve a maximum of 1MB of data
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                dynamoDb.scan(params, onScan);
            }
        }
    }

    dynamoDb.scan(params, onScan);
};
