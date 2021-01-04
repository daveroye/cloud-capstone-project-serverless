import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateAuctionRequest } from '../../requests/CreateAuctionRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { createAuction } from '../../businessLogic/auctions'

const logger = createLogger('createAuctions')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newAuction: CreateAuctionRequest = JSON.parse(event.body)
  logger.info('Creating Auction: ', newAuction)

  // get user ID from incoming request
  const userId = getUserId(event)
  logger.info('User ID: ', { userId: userId })

  const newItem = await createAuction(newAuction, userId)

  if (!newItem) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'DB server did not save new item'
      })
    }
  } else {
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newItem
      })
    }
  }
}
