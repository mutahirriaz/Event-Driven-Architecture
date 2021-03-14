#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EventFromAppsyncStack } from '../lib/event_from_appsync-stack';

const app = new cdk.App();
new EventFromAppsyncStack(app, 'EventFromAppsyncStack');
