#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EventbridgeWithLambdaStack } from '../lib/eventbridge-with-lambda-stack';

const app = new cdk.App();
new EventbridgeWithLambdaStack(app, 'EventbridgeWithLambdaStack');
