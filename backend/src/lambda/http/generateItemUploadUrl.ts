import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { generateAuctionItemUploadUrl } from '../../businessLogic/auctionItems'

const logger = createLogger('generateAuctionItemUploadURL')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // get auction and item ID from path
  const auctionId = event.pathParameters.auctionId
  const itemId = event.pathParameters.itemId
  logger.info('Add image to auction item: ', { auctionId: auctionId, itemId: itemId })

  const signedURL = await generateAuctionItemUploadUrl(auctionId, itemId)
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
