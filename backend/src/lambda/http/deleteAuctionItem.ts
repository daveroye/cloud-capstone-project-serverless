import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { deleteAuctionItem } from '../../businessLogic/auctionItems'

const logger = createLogger('deleteAuctionItems')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // get auction and item ID from path
  const auctionId = event.pathParameters.auctionId
  const itemId = event.pathParameters.itemId
  logger.info('Deleting auction item: ', { auctionId: auctionId, itemId: itemId })

  if (await deleteAuctionItem(auctionId, itemId)) {

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
        error: 'DB server did not delete auction item'
      })
    }
  }
}
