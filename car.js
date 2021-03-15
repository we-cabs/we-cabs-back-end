'use strict';


// const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.put = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);
   const carPlate=requestBody.carPlate ;
   const linkedUserId = requestBody.linkedUserId;
   const carManufactureYear = requestBody.carManufactureYear;
   const carDetails = requestBody.carDetails||{};

   if (  typeof carPlate !== 'string'|| typeof   linkedUserId!=='string'|| typeof   carManufactureYear!=='number'|| typeof   carDetails!=='object') {
       console.error(`Validation Failed ${typeof carPlate !== 'string'},${typeof   linkedUserId!=='string'},${typeof   carManufactureYear!=='number'},${typeof   carDetails!=='object'}`);
      callback(new Error('Couldn\'t submit car because of validation errors.'));
      return;
   }

   submitCar(carInfo(   carPlate,
   linkedUserId,
   carManufactureYear,
   carDetails ))
       .then(res => {
          callback(null, {
             statusCode: 200,
             headers: {
                "Access-Control-Allow-Origin": "*"
             },

             body: JSON.stringify({
                message: `Successfully submitted car`,
                carPlate: res.carPlate
             })
          });
       })
       .catch(err => {
          console.log(err);
          callback(null, {
             statusCode: 500,
             body: JSON.stringify({
                message: `Unable to submit car`
             })
          })
       });
};


const submitCar = car => {
   console.log('Submitting car');
   const carInfo = {
      TableName: process.env.CAR_TABLE,
      Item: car,
   };
   return dynamoDb.put(carInfo).promise()
       .then(res => car);
};

const carInfo = (carPlate,
                 linkedUserId,
                 carManufactureYear,
                 carDetails) => {
   const timestamp = new Date().getTime();
   return {

      carPlate:carPlate,
      linkedUserId: linkedUserId,
      carManufactureYear: carManufactureYear,
      carDetails:carDetails,
      updatedAt: timestamp,

   };
};

module.exports.list = (event, context, callback) => {
   var params = {
      TableName: process.env.CAR_TABLE,
      ProjectionExpression: "carPlate,linkedUserId,carManufactureYear,carDetails"
   };

   console.log("Scanning car table.");
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

module.exports.get = (event, context, callback) => {
   const params = {
      TableName: process.env.CAR_TABLE,
      Key: {
         carPlate: event.pathParameters.carPlate,
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
          callback(new Error('Couldn\'t fetch car.'));
          return;
       });
};

module.exports.listByUserId = (event, context, callback) => {
console.log(event.pathParameters)
   var params = {
      TableName: process.env.CAR_TABLE,
      ProjectionExpression: "carPlate,linkedUserId,carManufactureYear,carDetails",
      FilterExpression: '#linkedUserId = :linkedUserId',
      ExpressionAttributeValues: {
         ':linkedUserId': event.pathParameters.userId
      },
      ExpressionAttributeNames: {
         '#linkedUserId' : 'linkedUserId',
      },

   };


   console.log("Scanning car table.");
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
