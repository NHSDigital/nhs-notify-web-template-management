/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/create-email-template',
                destination: '/choose-template'
            },
            {
                source: '/create-nhs-app-template',
                destination: '/choose-template'
            },
            {
                source: '/create-sms-template',
                destination: '/choose-template'
            },
            {
                source: '/create-letter-template',
                destination: '/choose-template'
            },
            {
                source: '/review-nhs-app-template',
                destination: '/choose-template'
            }
        ];
    }
};
module.exports = nextConfig;
