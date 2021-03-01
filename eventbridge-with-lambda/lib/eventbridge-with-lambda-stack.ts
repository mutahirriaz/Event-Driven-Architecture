import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as eventTargets from "@aws-cdk/aws-events-targets"
import { Rule } from '@aws-cdk/aws-events';


export class EventbridgeWithLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const producerFn = new lambda.Function(this, "producerLambda", {
      code: lambda.Code.fromAsset("lambda"),
      handler: "producer.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });

    events.EventBus.grantPutEvents(producerFn);

    const consumerFn = new lambda.Function(this, "consumerLambda", {
      code: lambda.Code.fromAsset("lambda"),
      handler: "consumer.handler",
      runtime: lambda.Runtime.NODEJS_12_X
    });

    const result = new Rule(this, "EventRule", {
      targets: [new eventTargets.LambdaFunction(consumerFn)],
      eventPattern:{
        source: ["orderService"],
        detail: {
          // there is a condition price should be 1 of them
          price: ["100","500","1000"]
        }
      }
    })

  }
}
