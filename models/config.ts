export type Config = {
  tgUser: string;
  tgDenoWsTech: string;
  tgDenoWsBusiness: string;
  tgReportsBot: string;
  ngrok: string;
  origins: string[];
  projectName: string;
  mongoDb: string;
  coinsApi: string;
  coinsStoreApi: string;
  klineApis: {
    m15: string;
    h1: string;
    h4: string;
    symbol: string;
    oi: string;
    fr: string;
  };
};
