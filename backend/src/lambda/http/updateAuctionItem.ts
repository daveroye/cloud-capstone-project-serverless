import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateAuctionItemRequest } from '../../requests/UpdateAuctionItemRequest'
import { createLogger } from '../../utils/logger'
import { udpateAuctionItem } from '../../businessLogic/auctionItems'

const logger = createLogger('updateAuctionItems')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // get auction and item ID from path
  const auctionId = event.pathParameters.auctionId
  const itemId = event.pathParameters.itemId
  logger.info('Updating auction item: ', { auctionId: auctionId, itemId: itemId })

  const updatedAuctionItem: UpdateAuctionItemRequest = JSON.parse(event.body)
  logger.info('Update for Auction Item: ', updatedAuctionItem)

  if (await udpateAuctionItem(updatedAuctionItem, auctionId, itemId)) {

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: ""
    }
  } else {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'DB server did not update auction item'
      })
    }
  }

}
