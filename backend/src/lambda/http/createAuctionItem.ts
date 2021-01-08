import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateAuctionItemRequest } from '../../requests/CreateAuctionItemRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { createAuctionItem } from '../../businessLogic/auctionItems'

const logger = createLogger('createAuctionItems')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newAuctionItem: CreateAuctionItemRequest = JSON.parse(event.body)
  logger.info('Creating Auction Item: ', newAuctionItem)

  const auctionId = event.pathParameters.auctionId

  // get user ID from incoming request
  const userId = getUserId(event)
  logger.info('User ID: ', { userId: userId })

  const newItem = await createAuctionItem(newAuctionItem, auctionId, userId)

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
