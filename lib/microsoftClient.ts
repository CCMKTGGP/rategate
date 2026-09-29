import { ConfidentialClientApplication } from "@azure/msal-node";

export const msalConfig = {
  auth: {
    clientId: process.env.AZURE_AD_CLIENT_ID as string,
    authority: `https://login.microsoftonline.com/common/`,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
  },
};

let cca: ConfidentialClientApplication | null = null;

// create the msal client on first use so builds don't need the azure credentials
export function getMsalClient() {
  if (!cca) {
    cca = new ConfidentialClientApplication(msalConfig);
  }
  return cca;
}
