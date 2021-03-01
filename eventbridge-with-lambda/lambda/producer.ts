import {EventBridge} from "aws-sdk"


exports.handler = async function () {

    const eventBridge = new EventBridge()

    const result = await eventBridge.putEvents({
        Entries: [
            {
                EventBusName: "default",
                Source: "orderService",
                DetailType: "AddOrder",
                Detail: JSON.stringify({
                    name: "T-Shirt",
                    price: "500"
                })
            }
        ]
    }).promise();

    console.log("request", JSON.stringify(result))
    return{
        statusCode: 200,
        headers: {"Content-Type": "text/plain"},
        body: `Producer Event Hello CDK! You've hit ${JSON.stringify(result)}\n`
    }
}