import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getAuctionItems } from '../../businessLogic/auctionItems'

const logger = createLogger('getAuctionItems')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // get auction ID from path
  const auctionId = event.pathParameters.auctionId
  logger.info('Getting auction items for auction: ', { auctionId: auctionId })

  // fetch list of auction items
  const auctionItems = await getAuctionItems(auctionId)

  if (!auctionItems) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'DB server could not get a list of items'
      })
    }
  } else {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: auctionItems
      })
    }
  }
}
