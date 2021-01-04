import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

const logger = createLogger('auctionUtils')
const XAWS = AWSXRay.captureAWS(require('aws-sdk'))
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

// define routine to iteratively retrieve dynamoDB items by page
const getAllData = async (params: DocumentClient.QueryInput) => {
  const _getAllData = async (params, startKey) => {
    if (startKey) {
      if (params.ExclusiveStartKey) {
        params.ExclusiveStartKey = startKey
      } else {
        params = { ...params, ExclusiveStartKey: startKey }
      }
    }
    logger.info('Parameters used for query', params)
    return docClient.query(params).promise()
  }
  let lastEvaluatedKey = null
  let rows = []
  let pageNum: number = 0
  do {
    const result = await _getAllData(params, lastEvaluatedKey)
    rows = rows.concat(result.Items)
    lastEvaluatedKey = result.LastEvaluatedKey
    logger.info('LastEvalutatedKey from query: ',
      {
        lastEvaluatedKey: lastEvaluatedKey,
        pageNumber: ++pageNum
      })
  } while (lastEvaluatedKey)
  return rows
}

export async function getItems(queryParams: DocumentClient.QueryInput): Promise<any[]> {

  try {
    const allData = await getAllData(queryParams)
    logger.info('Matching items: ', allData)
    return allData
  }
  catch (error) {
    logger.error('error from DB on getting items: ', { error: error })
    return null
  }
}

export async function createItem(params: DocumentClient.PutItemInput): Promise<boolean> {
  try {
    const result = await docClient.put(params).promise()
    logger.info('result from DB on item create: ', { result: result })
    return true // successful item create
  }
  catch (error) {
    logger.error('error from DB on creating item: ', { error: error })
    return false // unsuccessful item create
  }
}

export async function updateItem(params: DocumentClient.UpdateItemInput): Promise<boolean> {
  try {
    const result = await docClient.update(params).promise()
    logger.info('result from updated DB item', { result: result })
    return true
  }
  catch (error) {
    logger.error('error from DB on updating item: ', { error: error })
    return false
  }
}

export async function deleteItem(params: DocumentClient.DeleteItemInput): Promise<boolean> {
  try {
    const result = await docClient.delete(params).promise()
    logger.info('deleted item from DB: ', { result: result })
    return true
  }
  catch (error) {
    logger.error('error from DB on updating item: ', { error: error })
    return false
  }
}

export async function storeUploadUrl(params: DocumentClient.UpdateItemInput) {
  try {
    const result = await docClient.update(params).promise()
    logger.info('result from DB on updating image URL: ', { result: result })
  }
  catch (error) {
    logger.error('URL for item could not be stored in DB', { error: error })
  }
}

export function getUploadUrl(imageId: string): string {
  try {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: imageId,
      Expires: parseInt(urlExpiration, 10)
    }) as string
  }
  catch (error) {
    logger.error('Fetching signed URL for image resulted in error', { error: error })
    return null
  }
}
