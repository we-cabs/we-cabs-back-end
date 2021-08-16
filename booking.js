'use strict';


const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.put = (event, context, callback) => {

   const requestBody = JSON.parse(event.body);
   console.log('requestBody');
   console.log(requestBody);
   const bookingId=requestBody.bookingId || undefined;
   const pickupPoint = requestBody.pickupPoint;
   const dropPoint = requestBody.dropPoint;
   const pickupTime = requestBody.pickupTime;
   const carType = requestBody.carType;
   const expiryTime = requestBody.expiryTime;
   const distance = requestBody.distance || 0;
   const customerDetails = requestBody.customerDetails || {};
   const allottedBidId=requestBody.allottedBidId || '';
   const status=requestBody.status||'';
   const maxPrice=requestBody.maxPrice||0;
   const minPrice=requestBody.minPrice||0;
   const basePrice=requestBody.basePrice||0;

   const reviewCollected=requestBody.reviewCollected||0;
   const notes=requestBody.notes||'';
   const companyReceivableAmount=requestBody.companyReceivableAmount||0;
   const tripType=requestBody.tripType;
   const location=requestBody.location;
   const allottedUserId=requestBody.allottedUserId||'';
   const isRequest=requestBody.isRequest||'';
   const startStopTripMessage= requestBody.startStopTripMessage || 'pending';

   if (typeof status !== 'string' ||typeof pickupPoint !== 'string' || typeof dropPoint !== 'string' || typeof pickupTime !== 'number'|| typeof carType !== 'string'|| typeof expiryTime !== 'number'|| typeof distance !== 'number'|| typeof customerDetails !== 'object'|| typeof allottedBidId !== 'string') {
    callback(new Error('Couldn\'t submit booking because of validation errors.'));
      return;
   }

   submitBooking(bookingInfo(pickupPoint, dropPoint, pickupTime, carType, expiryTime, distance, customerDetails,allottedBidId,status,bookingId, maxPrice,
   reviewCollected,
       companyReceivableAmount,
   notes,
   tripType,
   location,
   allottedUserId,minPrice,basePrice,isRequest,startStopTripMessage))
       .then(res => {
          callback(null, {
             statusCode: 200,headers: {
                "Access-Control-Allow-Origin": "*"
             },

             body: JSON.stringify({
                message: `Successfully submitted booking`,
                bookingId: res.bookingId
             })
          });
       })
       .catch(err => {
          console.log(err);
          callback(null, {
             statusCode: 500,
             body: JSON.stringify({
                message: `Unable to submit booking`
             })
          })
       });
};


const submitBooking = booking => {
   console.log('Submitting booking');
   const bidInfo = {
      TableName: process.env.BOOKING_TABLE,
      Item: booking,
   };
   return dynamoDb.put(bidInfo).promise()
       .then(res => booking);
};

const bookingInfo = (pickupPoint, dropPoint, pickupTime, carType, expiryTime, distance, customerDetails,allottedBidId,status,bookingId, maxPrice,
                     reviewCollected,
                     companyReceivableAmount,
                     notes,
                     tripType,
                     location,
                     allottedUserId,minPrice,basePrice,isRequest,startStopTripMessage) => {
   const timestamp = new Date().getTime();
   return {
      bookingId: bookingId||uuid.v1(),
      pickupPoint:pickupPoint,
      dropPoint:dropPoint,
      pickupTime:pickupTime,
      carType:carType,
      expiryTime:expiryTime,
      distance:distance,
      customerDetails:customerDetails,
      allottedBidId:allottedBidId,
      submittedAt: timestamp,
      updatedAt: timestamp,
      status:status,
      reviewCollected:reviewCollected,
      companyReceivableAmount:companyReceivableAmount,
      notes:notes,
      tripType:tripType,
      location:location,
      allottedUserId:allottedUserId,
      maxPrice:maxPrice,
      minPrice:minPrice,
      basePrice:basePrice,
      isRequest:isRequest,
      startStopTripMessage:startStopTripMessage
   };
};

module.exports.list = (event, context, callback) => {

   var params = {
      TableName: process.env.BOOKING_TABLE,
      // ProjectionExpression: "bookingId, pickupPoint, dropPoint, pickupTime, carType, expiryTime, distance, customerDetails,allottedBidId,maxAmount,reviewCollected,companyReceivableAmount,notes,tripType,location,allottedUserId"
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
               bookings: data.Items
            })
         });
      }

   };

   dynamoDb.scan(params, onScan);

};

module.exports.get = (event, context, callback) => {
   const params = {
      TableName: process.env.BOOKING_TABLE,
      Key: {
         bookingId: event.pathParameters.bookingId,
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
          callback(new Error('Couldn\'t fetch booking.'));
          return;
       });
};

module.exports.listByUserId = (event, context, callback) => {
   console.log(event.pathParameters)
   var params = {
      TableName: process.env.BOOKING_TABLE,
      // ProjectionExpression: "carPlate,linkedUserId,carManufactureYear,carDetails",
      FilterExpression: '#allottedUserId = :allottedUserId',
      ExpressionAttributeValues: {
         ':allottedUserId': event.pathParameters.userId
      },
      ExpressionAttributeNames: {
         '#allottedUserId' : 'allottedUserId',
      },

   };


   console.log("Scanning booking table.");
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

module.exports.listByLocation = (event, context, callback) => {
   console.log(event.pathParameters)
   var params = {
      TableName: process.env.BOOKING_TABLE,
      // ProjectionExpression: "carPlate,linkedUserId,carManufactureYear,carDetails",
      FilterExpression: '#location = :location',
      ExpressionAttributeValues: {
         ':location': event.pathParameters.location
      },
      ExpressionAttributeNames: {
         '#location' : 'location',
      },

   };


   console.log("Scanning booking table.");
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
