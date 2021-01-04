import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { getAuctions } from '../../businessLogic/auctions'

const logger = createLogger('getAuctions')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  // get user ID from incoming request
  const userId = getUserId(event)
  logger.info('User ID: ', { userId: userId })

  // fetch list of user's auctions
  const auctions = await getAuctions(userId)

  if (!auctions) {
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
        items: auctions
      })
    }
  }
}
