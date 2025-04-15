export type Config = {
  tgUser: string;
  tgDenoWsTech: string;
  tgDenoWsBusiness: string;
  tgReportsBot: string;
  ngrok: string;
  allowedOrigins: string[];
  projectName: string;
  mongoDb: string;
  coinsApi: string;
  coinsStoreApi: string;
  googleAuth: {
    clientId: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
    javascript_origins: string[];
  };
  klineApis: {
    m15: string;
    h1: string;
    h4: string;
    symbol: string;
    oi: string;
    fr: string;
  };
};
