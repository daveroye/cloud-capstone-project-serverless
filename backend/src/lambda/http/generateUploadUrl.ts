import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { generateUploadUrl } from '../../businessLogic/auctions'

const logger = createLogger('generateUploadURL')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const auctionId = event.pathParameters.auctionId
  logger.info('Upload URL for AuctionID: ', { auctionId: auctionId })

  // get user ID from incoming request
  const id = getUserId(event)
  logger.info('User ID: ', { userId: id })

  try {
    const signedURL = await generateUploadUrl(id, auctionId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: signedURL
      })
    }
  }
  catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error
      })
    }
  }
}
