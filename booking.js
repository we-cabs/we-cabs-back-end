'use strict';


const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.put = (event, context, callback) => {
   const requestBody = JSON.parse(event.body);
   const bookingId=requestBody.bookingId || undefined
   const pickupPoint = requestBody.pickupPoint;
   const dropPoint = requestBody.dropPoint;
   const pickupTime = requestBody.pickupTime;
   const carType = requestBody.carType;
   const expiryTime = requestBody.expiryTime;
   const distance = requestBody.distance || 0;
   const customerDetails = requestBody.customerDetails || {};
   const allottedBidId=requestBody.allottedBidId || '';
   const status=requestBody.status||'';
   const maxAmount=requestBody.maxAmount;
   const reviewCollected=requestBody.reviewCollected||0;
   const notes=requestBody.notes||'';
   const companyReceivableAmount=requestBody.companyReceivableAmount||0;
   const tripType=requestBody.tripType;
   const location=requestBody.location;
   const allottedUserId=requestBody.allottedUserId||'';

   if (typeof status !== 'string' ||typeof pickupPoint !== 'string' || typeof dropPoint !== 'string' || typeof pickupTime !== 'number'|| typeof carType !== 'string'|| typeof expiryTime !== 'number'|| typeof distance !== 'number'|| typeof customerDetails !== 'object'|| typeof allotedBid !== 'string') {
      console.error('Validation Failed');
      callback(new Error('Couldn\'t submit booking because of validation errors.'));
      return;
   }

   submitBooking(bookingInfo(pickupPoint, dropPoint, pickupTime, carType, expiryTime, distance, customerDetails,allottedBidId,status,bookingId, maxAmount,
   reviewCollected,
       companyReceivableAmount,
   notes,
   tripType,
   location,
   allottedUserId))
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

const bookingInfo = (pickupPoint, dropPoint, pickupTime, carType, expiryTime, distance, customerDetails, allottedBidId, status, bookingId, maxAmount,
                     reviewCollected,
                     companyReceivableAmount,
                     notes,
                     tripType,
                     location,
                     allottedUserId) => {
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
      allottedBidId:allotedBid,
      submittedAt: timestamp,
      updatedAt: timestamp,
      status:status,
      reviewCollected:reviewCollected,
      companyReceivableAmount:companyReceivableAmount,
      notes:notes,
      tripType:tripType,
      location:location,
      allottedUserId:allottedUserId,
      maxAmount:maxAmount
   };
};

module.exports.list = (event, context, callback) => {

   var params = {
      TableName: process.env.BOOKING_TABLE,
      ProjectionExpression: "bookingId, pickupPoint, dropPoint, pickupTime, carType, expiryTime, distance, customerDetails,allottedBidId,maxAmount,reviewCollected,companyReceivableAmount,notes,tripType,location,allottedUserId"
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
