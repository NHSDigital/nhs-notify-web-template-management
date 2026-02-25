import type { APIGatewayProxyHandler } from 'aws-lambda';
import { randomUUID } from 'node:crypto';
import { apiSuccess, apiFailure } from './api/responses';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { PinpointSMSVoiceV2Client, SendTextMessageCommand } from '@aws-sdk/client-pinpoint-sms-voice-v2';

type CreateContactDetailRequest = {
    contactDetailType: string;
    contactDetailValue: string;
};

const SEND_TYPE: 'pinpoint' | 'sms' = 'pinpoint';

const client = DynamoDBDocumentClient.from(new DynamoDBClient());
const snsClient = new SNSClient();
const smsVoiceClient = new PinpointSMSVoiceV2Client();

export const handler: APIGatewayProxyHandler = async (event) => {
    const { internalUserId, clientId } = event.requestContext.authorizer ?? {};

    if (!process.env.CONTACT_DETAILS_TABLE_NAME || !process.env.SENDER_ID) {
        throw new Error('lambda misconfiguration');
    }

    if (!clientId || !internalUserId) {
      return apiFailure(400, 'Invalid request');
    }

    const { contactDetailType, contactDetailValue }: CreateContactDetailRequest = JSON.parse(event.body || '{}');

    const id = randomUUID();

    const otp = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');

    await client.send(
        new PutCommand({
            TableName: process.env.CONTACT_DETAILS_TABLE_NAME,
            Item: {
                owner: `CLIENT#${clientId}`,
                status: 'PENDING',
                id,
                contactDetailType,
                contactDetailValue,
                otp,
            }
        })
    );

    if (contactDetailType === 'SMS') {

        if (SEND_TYPE === 'pinpoint') {
            await smsVoiceClient.send(
                new SendTextMessageCommand({
                    DestinationPhoneNumber: contactDetailValue,
                    MessageBody: `Your one-time passcode is ${otp}. Please use this to verify your contact details in the NHS Notify Web UI.`,
                    MessageType: 'TRANSACTIONAL',
                    ConfigurationSetName: process.env.CONFIGURATION_SET_NAME,
                    OriginationIdentity: process.env.SENDER_ID,
                    
                })
            );
        } else {
            await snsClient.send(
                new PublishCommand({
                    PhoneNumber: contactDetailValue,
                    Message: `Your one-time passcode is ${otp}. Please use this to verify your contact details in the NHS Notify Web UI.`,
                    MessageAttributes: {
                        'AWS.SNS.SMS.SenderID': {
                            DataType: 'String',
                            StringValue: process.env.SENDER_ID
                        },
                        'AWS.SNS.SMS.SMSType': {
                            DataType: 'String',
                            StringValue: 'Transactional'
                        },
                    }
                })
            );
        }
    }

    return apiSuccess(201, { statusCode: 201, data: {
        id,
        otp,
    }});
}