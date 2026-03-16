// Reads secrets from environment variables — never commit real keys here.
// Copy .env.example to .env.local and fill in your values.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    saveChatUrl: process.env.SAVE_CHAT_URL ?? 'https://solai.se/dppx/get-chats/',
    flowiseChatflowMap: {
      'https://solai.se': process.env.FLOWISE_SOLAI_ID ?? '',
      'https://demo.cirtag.eu': process.env.FLOWISE_DEMO_ID ?? '',
    },
    flowiseDefaultChatflowId: process.env.FLOWISE_DEFAULT_ID ?? '',
    // DPP PCB Analysis API
    dppApiUrl: process.env.DPP_API_URL ?? 'https://solai.se/dppx/api',
    dppClientId: process.env.DPP_CLIENT_ID ?? '',
    dppClientSecret: process.env.DPP_CLIENT_SECRET ?? '',
  },
});
