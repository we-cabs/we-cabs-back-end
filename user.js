'use strict';


// const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.put = (event, context, callback) => {
   const requestBody = JSON.parse(event.body);
   const name= requestBody.name
   const profileImgUrl = requestBody.profileImgUrl || 'https://reqres.in/img/faces/4-image.jpg'
   const phone = requestBody.phone;
   const email = requestBody.email;
   const role = requestBody.role|| '';
   const location = requestBody.location|| '';
   const password = requestBody.password  || '';
   const carsAvailable= requestBody.carsAvailable || 0;
   const carsBooked= requestBody.carsBooked || 0;
   const carsDetails= requestBody.carsDetails || {};
   const bookingsCount=requestBody.bookingsCount || 0
   const avgRating=requestBody.avgRating || 0
   const approvalStatus=requestBody.approvalStatus||'notApproved'
   const imagesNames=requestBody.imagesNames||{}

   if (typeof carsBooked !== 'number' ||typeof bookingsCount !== 'number' || typeof avgRating !== 'number' || typeof role !== 'string' || typeof location !== 'string' ||  typeof carsAvailable !== 'number' ||typeof carsDetails !== 'object' || typeof name !== 'string' ||typeof profileImgUrl !== 'string' || typeof phone !== 'string' || typeof email !== 'string'|| typeof password !== 'string') {
      console.error('Validation Failed');
      callback(new Error('Couldn\'t submit user because of validation errors.'));
      return;
   }

   submitUser(userInfo(name,profileImgUrl ,phone,email, password,carsAvailable,carsDetails,role,location,bookingsCount,avgRating,carsBooked,approvalStatus,imagesNames))
       .then(res => {
          callback(null, {
             statusCode: 200,headers: {
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

const userInfo = (name,profileImgUrl ,phone,email, password,carsAvailable,carsDetails,role,location,bookingsCount,avgRating,carsBooked,approvalStatus,imagesNames) => {
   const timestamp = new Date().getTime();
   return {
      // id: uuid.v1(),
      name:name,
      profileImgUrl: profileImgUrl,
      email: email,
      phone: phone,
      password: password,
      submittedAt: timestamp,
      updatedAt: timestamp,
      carsAvailable:carsAvailable,
      carsBooked:carsBooked,
      carsDetails:carsDetails,
      role:role,
      location:location,
      bookingsCount:bookingsCount,
      avgRating:avgRating,
      approvalStatus:approvalStatus,
      userId:phone,
      imagesNames:imagesNames

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
             statusCode: 200,headers: {
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
         '#location' : 'location',
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
            statusCode: 200,headers: {
               "Access-Control-Allow-Origin": "*"
            },

            body: JSON.stringify({
               cars: data.Items
            })
         });
      }

   };

   dynamoDb.scan(params, onScan);
};
