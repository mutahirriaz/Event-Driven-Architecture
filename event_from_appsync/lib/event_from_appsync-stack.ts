import * as cdk from '@aws-cdk/core';
import * as lambda from "@aws-cdk/aws-lambda";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import * as targets from "@aws-cdk/aws-events-targets";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { requestTemplate, responseTemplate } from '../utils/appsync-request-response';
export class EventFromAppsyncStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const api = new appsync.GraphqlApi(this, "Api", {
      name: "appsyncEventBeidgeApi",
      schema: appsync.Schema.fromAsset('schema/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          },
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // HTTP DATASOURCE
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsWithEventBridge",
        description: "From Appsync To Event Bridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      });
    events.EventBus.grantAllPutEvents(httpDs);

    const todosLambda = new lambda.Function(this , "todosLambda" , {
      runtime : lambda.Runtime.NODEJS_10_X,
      code : lambda.Code.fromAsset("lambda"),
      handler : "main.handler"
    });

    const mutations = ["createEvent"]

    mutations.forEach((mut) => {

      if(mut === "createEvent"){
        let details =  `\\\"event\\\": \\\"$ctx.arguments.event\\\"`

        const putEventResolver = httpDs.createResolver({
          typeName: "Mutation",
          fieldName: mut,
          requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details , mut)),
          responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate()),
        });
    
      }
    

    

    });

    // Resolver
    
   

    const dynamodbTable = new dynamodb.Table(this, 'AddTodo_Event', {
      tableName: 'AddTodo_Event',
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      },
    });

    dynamodbTable.grantFullAccess(todosLambda);
    todosLambda.addEnvironment('ADDTODO_EVENTS', dynamodbTable.tableName);


    // Testing Echo Lambda
    // const echoLambda = new lambda.Function(this, "echoFunction", {
    //   code: lambda.Code.fromInline(
    //     "exports.handler = (event, context) => { console.log(event); context.succeed(event); }"
    //   ),
    //   runtime: lambda.Runtime.NODEJS_12_X,
    //   handler: "index.handler"
    // });

    // RULE ON DEFAULT EVENT BUS TO TARGET ECHO LAMBDA
    const rule = new events.Rule(this, "AppSyncEventBridgeRule", {
      eventPattern: {
        source: ["eru-appsync-events"],
          // every event that has source = "eru-appsync-events" will be sent to our echo lambda
        detailType : [...mutations]
      },
    });
    rule.addTarget(new targets.LambdaFunction(todosLambda));

  }
}
