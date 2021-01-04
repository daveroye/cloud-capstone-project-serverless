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

  const signedURL = await generateUploadUrl(id, auctionId)
  if (signedURL) {
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
  else {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({error: "A valid URL was not returned"})
    }
  }
}
