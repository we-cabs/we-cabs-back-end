'use strict';


const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.put = (event, context, callback) => {
   const requestBody = JSON.parse(event.body);
   const bidId=requestBody.bidId||undefined
   const linkedUserId = requestBody.linkedUserId;
   const linkedBookingId = requestBody.linkedBookingId;
   const amount = requestBody.amount;
   const carPlate = requestBody.carPlate||'';
   const linkedUserRating=requestBody.linkedUserRating;
   const status=requestBody.status||'';

   if (typeof linkedUserRating !== 'number' ||typeof linkedUserId !== 'string' || typeof linkedBookingId !== 'string' || typeof amount !== 'number'|| typeof carPlate !== 'string') {
      console.error(typeof linkedUserRating !== 'number' ||typeof linkedUserId !== 'string' || typeof linkedBookingId !== 'string' || typeof amount !== 'number'|| typeof carPlate !== 'string')
      console.error('Validation Failed');
      callback(new Error('Couldn\'t submit bid because of validation errors.'));
      return;
   }

   submitBid(bidInfo(linkedUserId,linkedBookingId,amount,carPlate,linkedUserRating,bidId,status))
       .then(res => {
          callback(null, {
             statusCode: 200,
             headers: {
                "Access-Control-Allow-Origin": "*"
             },

             body: JSON.stringify({
                message: `Successfully submitted bid`,
                bidId: res.bidId
             })
          });
       })
       .catch(err => {
          console.log(err);
          callback(null, {
             statusCode: 500,
             body: JSON.stringify({
                message: `Unable to submit bid`
             })
          })
       });
};


const submitBid = bid => {
   console.log('Submitting bid');
   const bidInfo = {
      TableName: process.env.BID_TABLE,
      Item: bid,
   };
   return dynamoDb.put(bidInfo).promise()
       .then(res => bid);
};

const bidInfo = (linkedUserId,linkedBookingId,amount,carPlate,linkedUserRating,bidId,status) => {
   const timestamp = new Date().getTime();
   return {
      bidId: bidId || uuid.v1(),
      linkedUserId:linkedUserId,
      linkedBookingId:linkedBookingId,
      amount:amount,
      carPlate:carPlate,
      submittedAt: timestamp,
      updatedAt: timestamp,
      linkedUserRating:linkedUserRating,
      status:status
   };
};

module.exports.list = (event, context, callback) => {
   var params = {
      TableName: process.env.BID_TABLE,
      // ProjectionExpression: "bidId,linkedUserId,linkedBookingId,amount,carPlate,status,updatedAt"
   };

   console.log("Scanning Bid table.");
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
               bids: data.Items
            })
         });
      }

   };

   dynamoDb.scan(params, onScan);

};

module.exports.get = (event, context, callback) => {
   console.log(event,context)
   const params = {
      TableName: process.env.BID_TABLE,
      Key: {
         bidId: event.pathParameters.bidId,
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
          callback(new Error('Couldn\'t fetch bid.'));
          return;
       });
};


module.exports.listByUserId = (event, context, callback) => {
   console.log(event.pathParameters)
   var params = {
      TableName: process.env.BID_TABLE,
      // ProjectionExpression: "carPlate,linkedUserId,carManufactureYear,carDetails,status,updatedAt",
      FilterExpression: '#linkedUserId = :linkedUserId',
      ExpressionAttributeValues: {
         ':linkedUserId': event.pathParameters.userId
      },
      ExpressionAttributeNames: {
         '#linkedUserId' : 'linkedUserId',
      },

   };


   console.log("Scanning bid table.");
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
               bids: data.Items
            })
         });
      }

   };

   dynamoDb.scan(params, onScan);
};

module.exports.listByBookingId = (event, context, callback) => {
   console.log(event.pathParameters)
   var params = {
      TableName: process.env.BID_TABLE,
      // ProjectionExpression: "carPlate,linkedUserId,carManufactureYear,carDetails,status,updatedAt",
      FilterExpression: '#linkedBookingId = :linkedBookingId',
      ExpressionAttributeValues: {
         ':linkedBookingId': event.pathParameters.bookingId
      },
      ExpressionAttributeNames: {
         '#linkedBookingId' : 'linkedBookingId',
      },

   };


   console.log("Scanning bid table.");
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
               bids: data.Items
            })
         });
      }

   };

   dynamoDb.scan(params, onScan);
};
