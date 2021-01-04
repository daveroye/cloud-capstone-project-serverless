import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateAuctionRequest } from '../../requests/UpdateAuctionRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { udpateAuction } from '../../businessLogic/auctions'

const logger = createLogger('updateAuctions')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auctionId = event.pathParameters.auctionId
  logger.info('Updating Auction: ', { auctionId: auctionId })

  // get user ID from incoming request
  const id = getUserId(event)
  logger.info('User ID: ', { userId: id })

  const updatedAuction: UpdateAuctionRequest = JSON.parse(event.body)
  logger.info('Update for Auction: ', updatedAuction)

  if (await udpateAuction(updatedAuction, id, auctionId)) {

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
