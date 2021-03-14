import { EventBridgeEvent, Context } from 'aws-lambda';
import { randomBytes } from "crypto";
import * as AWS from 'aws-sdk';
const dynamoClient = new AWS.DynamoDB.DocumentClient();




exports.handler = async (event: EventBridgeEvent<string , any> , context:Context) => {

   try {
    console.log("event>>>>" , event)

    if(event["detail-type"] === "createEvent"){
        const params = {
            TableName : process.env.ADDTODO_EVENTS || "",
            Item : {
                id : randomBytes(16).toString("hex"),
                ...event.detail
            }
        };
         await dynamoClient.put(params).promise();
    }
   }
   catch(err){
    console.log("error" , err);
   }

}