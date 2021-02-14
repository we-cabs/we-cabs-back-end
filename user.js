'use strict';


const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.put = (event, context, callback) => {
   const requestBody = JSON.parse(event.body);
   const name = requestBody.name;
   const phone = requestBody.phone;
   const email = requestBody.email;
   const password = requestBody.password;

   if (typeof name !== 'string' || typeof phone !== 'string' || typeof email !== 'string'|| typeof password !== 'string') {
      console.error('Validation Failed');
      callback(new Error('Couldn\'t submit user because of validation errors.'));
      return;
   }

   submitUser(userInfo(name, phone,email, password))
       .then(res => {
          callback(null, {
             statusCode: 200,
             body: JSON.stringify({
                message: `Successfully submitted user with email ${email}`,
                userId: res.id
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

const userInfo = (name, phone,email, password) => {
   const timestamp = new Date().getTime();
   return {
      id: uuid.v1(),
      name: name,
      email: email,
      phone: phone,
      password: password,
      submittedAt: timestamp,
      updatedAt: timestamp,
   };
};

module.exports.list = (event, context, callback) => {
   var params = {
      TableName: process.env.USER_TABLE,
      ProjectionExpression: "id, name, email, phone, password"
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
         id: event.pathParameters.id,
      },
   };

   dynamoDb.get(params).promise()
       .then(result => {
          const response = {
             statusCode: 200,
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
