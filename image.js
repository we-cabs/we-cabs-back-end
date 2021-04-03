const AWS = require('aws-sdk');
const s3 = new AWS.S3()
const URL_EXPIRATION_SECONDS = 300
AWS.config.setPromisesDependency(require('bluebird'));

module.exports.get =  (event, context, callback) => {

   const name = event.pathParameters.name
   const Key = `${name}.jpg`

   // Get signed URL from S3
   const s3Params = {
      Bucket: 'wecabsbucket',
      Key,
      Expires: 300,
      ContentType: 'image/jpeg',
   }

 s3.getSignedUrlPromise('putObject', s3Params).then((uploadURL)=>{

    const response=   {
      statusCode: 200,headers: {
         "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
         uploadURL: uploadURL,
         Key
      })
   };
console.log(response)
      callback(null, response);
 }

      )

}

