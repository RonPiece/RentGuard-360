/**
 * AWS Amplify Configuration
 * This file configures AWS services for the RentGuard 360 application
 */

const awsConfig = {
    // Cognito Authentication
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_USER_POOL_ID,
            userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
            identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
            signUpVerificationMethod: 'code',
            loginWith: {
                email: true,
                username: true,
            },
            // Specify we use email as alias, not as username
            userAttributes: {
                email: {
                    required: true,
                },
            },
        },
    },

    // S3 Storage
    Storage: {
        S3: {
            bucket: import.meta.env.VITE_S3_BUCKET,
            region: import.meta.env.VITE_AWS_REGION,
        },
    },
};

export default awsConfig;

// Export individual config sections for convenience
export const authConfig = awsConfig.Auth;
export const storageConfig = awsConfig.Storage;

// AWS Region constant
export const AWS_REGION = import.meta.env.VITE_AWS_REGION;

// DynamoDB Table names
export const DYNAMODB_TABLES = {
    contracts: import.meta.env.VITE_DYNAMODB_CONTRACTS_TABLE,
    analysis: import.meta.env.VITE_DYNAMODB_ANALYSIS_TABLE,
};

// S3 Bucket name
export const S3_BUCKET = import.meta.env.VITE_S3_BUCKET;
