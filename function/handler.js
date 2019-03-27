const AWS = require('aws-sdk')
const DynamoDB = new AWS.DynamoDB.DocumentClient() // HTTP keep-alive already enabled!

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!'
    })
  }
}
