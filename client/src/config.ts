// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'q45v80le31'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-d7q8ao93.us.auth0.com',            // Auth0 domain
  clientId: 'I67zi79Saf40kD6CZtaMC4mMwZbzrLtK',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
