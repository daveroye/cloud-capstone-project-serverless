# Serverless Silent Auction App

This project implements a simple silent auction application using AWS Lambda and Serverless framework. The app uses Auth0 authentication that allows a user to login and create, update, and delete silent auction like you might use for fundraising for schools, non-profit organizations, or clubs.

# Functionality of the application

This application will allow creating/removing/updating/fetching silent auction event items. Each silent auction item can optionally have an attachment image. Each user only has access to modify silent auction events that he/she has created.

# Silent Auction event items

The application should store auction items, and each auction item contains the following fields:

* `userId` (string) - id of the user logged in and creating the silent auction event
* `auctionId` (string) - a unique id for an auction
* `createdAt` (string) - date and time when an auction was created
* `name` (string) - name of a silent auction event (e.g. "Elm High School Band Fundraiser")
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to an auction
* `auctionState` (AuctionEvent enum) - state of the silent auction event
``` AuctionEvent enum
  [
    "CREATED",          // For a newly created aucttion that is ready to use
    "OPEN_FOR_ITEMS",   // Start collecting items for use in the silent auction
    "STARTED",          // Start the silent auction and start taking bids on items
    "ENDED",            // End the auction and stop taking bids and determine the item's winning bid
    "CLOSED"            // All items claimed and auction is finished
  ]
```
* `startedAt` (string) (optional until auction started) - date and time when auction was started
* `endedAt` (string) (optional until auction ended) - date and time when auction was ended

# Auction Event Functions implemented

The following functions are implemented and configured in the `serverless.yml` file:

* `Auth` - this function implements a custom authorizer for API Gateway that is added to all other functions.

* `GetAuctions` - returns all Auctions for the current user. A user id is extracted from a JWT token that is sent by the frontend

It should return data that looks like this:

```json
{
  "items": [
    {
      "auctionId": "123",
      "createdAt": "2021-07-27T20:01:45.424Z",
      "name": "Bill's Fundraiser",
      "auctionState": "CREATED",
      "attachmentUrl": "http://example.com/image.png"
    },
    {
      "auctionId": "456",
      "createdAt": "2020-07-27T20:01:45.424Z",
      "name": "Scott Park Elemtary Art Projects",
      "auctionState": "OPEN_FOR_ITEMS",
      "attachmentUrl": "http://example.com/image.png"
    },
  ]
}
```

* `CreateAuction` - creates a new Auction for the current user. The shape of the data to be sent by a client application to this function can be found in the `CreateAuctionRequest.ts` file

It receives a new Auction item to be created in JSON format that looks like this:

```json
{
  "createdAt": "2019-07-27T20:01:45.424Z",
  "name": "Fundraiser",
  "attachmentUrl": "http://example.com/image.png"
}
```

It should return a new Auction item that looks like this:

```json
{
  "item": {
    "auctionId": "123",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "name": "Fundraiser",
    "auctionState": "CREATED",
    "attachmentUrl": "http://example.com/image.png"
  }
}
```

* `UpdateAuction` - should update an Auction item created by the current user. The shape of the data to be sent by a client application to this function can be found in the `UpdateAuctionRequest.ts` file

It receives an object that contains two fields that can be updated in a Auction item:

```json
{
  "name": "Scott Park Elemtary Art Projects",
  "auctionState": "OPEN_FOR_ITEMS"
}
```

The id of an item that should be updated is passed as a URL parameter.

It should return an empty body.

* `DeleteAuction` - deletes an Auction item created by the current user. Expects an id of an Auction item to remove.

It should return an empty body.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for an Auction item.

It should return a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

All functions are connected to appropriate events from API Gateway.

An id of a user is extracted from a JWT token passed by a client.

Necessary resources have been added to the `resources` section of the `serverless.yml` file such as DynamoDB table and S3 bucket.


# Auction item objects

The application should store item for each auction, and each auction item contains the following fields:

* `auctionId` (string) - id of the auction that this item belongs to
* `itemId` (string) - a unique id for an item
* `itemUserId` (string) - id of the user that created this auction item
* `createdAt` (string) - date and time when an item was created
* `itemName` (string) - name of a silent auction item (e.g. "Opera tickets")
* `forSale` (boolean) - indicates the item has a starting bid and can be including in the auction for sale
* `bidValue` (number) - amount in dollars that is bid for the item
* `bidUserId` (string) - the user ID of the bidder
* `description` (sting) - a description of the auction item
* `attachmentUrl` (string) (optional) - a URL pointing to an image attached to an auction item


# Auction Item Functions implemented

The following functions are implemented and configured in the `serverless.yml` file:

* `GetAuctionItems` - returns all Auction items for the current user or all items depending on the filter set.

It should return data that looks like this:

```json
{
  "items": [
    {
      "auctionId": "123",
      "itemId": "5465",
      "itemUserId": "Doodle-13423",
      "createdAt": "2021-07-27T20:01:45.424Z",
      "itemName": "Tennis Racket",
      "forSale": "true",
      "attachmentUrl": "http://example.com/image.png"
    },
    {
      "auctionId": "456",
      "itemId": "67856",
      "itemUserId": "Poodle-56756",
      "createdAt": "2020-07-27T20:01:45.424Z",
      "itemName": "Painting of Frog",
      "forSale": "false",
      "attachmentUrl": "http://example.com/image.png"
    },
  ]
}
```

* `CreateAuctionItem` - creates a new Auction item for the current user. The shape of the data to be sent by a client application to this function can be found in the `CreateAuctionItemRequest.ts` file

It receives a new Auction item to be created in JSON format that looks like this:

```json
{
  "createdAt": "2019-07-27T20:01:45.424Z",
  "itemName": "Pencil",
  "attachmentUrl": "http://example.com/image.png"
}
```

It should return a new Auction item that looks like this:

```json
{
  "item": {
    "auctionId": "123",
    "itemId": "456",
    "itemUserId": "Fred-345345",
    "createdAt": "2019-07-27T20:01:45.424Z",
    "itemName": "Pencil",
    "forSale": "false",
    "attachmentUrl": "http://example.com/image.png"
  }
}
```

* `UpdateAuctionItem` - should update an Auction item. The shape of the data to be sent by a client application to this function can be found in the `UpdateAuctionItemRequest.ts` file

It receives an object that contains four fields that can be updated in a Auction item:

```json
{
  "itemName": "Dress Pants",
  "bidValue": 45,
  "bidUserId": "donna-353454",
  "description": "long inseam and slim waisted"
}
```

The id of the auction and an item that should be updated is passed as a URL parameter.

It should return an empty body.

* `DeleteAuction` - deletes an Auction item created by the current user. Expects an id of an Auction item to remove.

It should return an empty body.

* `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for an Auction item.

It should return a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

All functions are connected to appropriate events from API Gateway.


# Frontend

The `client` folder contains a web application that uses the API that has been developed in this project.

This frontend works with the serverless application that was developed and deployed as a sererless app to AWS. A config file `config.ts` in the `client` folder is used to set parameters for the API endpoint and the Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

## Authentication

Authentication is implemented in the application. An Auth0 application was created and "domain" and "client id" were copied to the `config.ts` file in the `client` folder. Asymmetrically encrypted JWT tokens were used and a certificate is programatically downloaded from Auth0 and used to verify the JWT token signature.

## Logging

This application was configured to use the [Winston](https://github.com/winstonjs/winston) logger that creates [JSON formatted](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/) log statements. It was uses to write log messages like this:

```ts
import { createLogger } from '../../utils/logger'
const logger = createLogger('auth')

// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system
logger.info('User was authorized', {
  // Additional information stored with a log statement
  key: 'value'
})
```

# Database Implementation

To store Auction items, a DynamoDB table with local secondary index(es) was used. The query method was used instead of scan for more efficient retrieval of data items. Also, pagination support was implemented to work around the DynamoDB limitation that allows only up to 1MB of data using a query method.

# How to run the application

## Backend

To deploy the application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run the client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless silent auction application.

# Postman collection

An alternative way to test the API is to use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")


Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")


Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")


Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")
