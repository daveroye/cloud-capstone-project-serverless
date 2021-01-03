import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Auction } from '../models/Auction'
import { UpdateAuctionRequest } from '../requests/UpdateAuctionRequest'

const XAWS = AWSXRay.captureAWS(require('aws-sdk'))
const logger = createLogger('auctionAccess')
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class AuctionAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly auctionTable = process.env.AUCTIONS_TABLE,
        private readonly indexName = process.env.INDEX_NAME) {
    }

    async getAuctions(userId: string): Promise<Auction[]> {
        logger.info('Getting all auction items')

        // define query paramaters to be used to get all auction items including a key for pagination
        const queryParams = { TableName: this.auctionTable,
//                              Limit: 4, // used to test pagination
                              IndexName: this.indexName,
                              KeyConditionExpression: 'userId = :userId',
                              ExpressionAttributeValues: { ':userId': userId }}
        
        // define routine to iteratively retrieve items by page
        const getAllData = async (params) => {
            const _getAllData = async (params, startKey) => {
                if (startKey) {
                    if (params.ExclusiveStartKey) {
                        params.ExclusiveStartKey = startKey
                    } else {
                    params = {...params, ExclusiveStartKey: startKey}
                    }
                }
                logger.info('Parameters used for query', params)
                return this.docClient.query(params).promise()
            }
            let lastEvaluatedKey = null
            let rows = []
            let pageNum : number = 0
            do {
                const result = await _getAllData(params, lastEvaluatedKey)
                rows = rows.concat(result.Items)
                lastEvaluatedKey = result.LastEvaluatedKey
                logger.info('LastEvalutatedKey from query: ', 
                            {lastEvaluatedKey: lastEvaluatedKey, 
                             pageNumber: ++pageNum})
            } while (lastEvaluatedKey)
            return rows
        }

        try {
            const allData = await getAllData(queryParams)
            logger.info('Matching Auction items: ', allData)
            return allData as Auction[]
        }
        catch (error) {
            logger.error('error from DB on getting auctions: ', { error: error })
            return null
        }
    }

    async createAuction(auction: Auction): Promise<Auction> {
        try {
            const result = await this.docClient.put({
                TableName: this.auctionTable,
                Item: auction
            }).promise()
            logger.info('result from DB on auction create: ', { result: result })
            return auction
        }
        catch (error) {
            logger.error('error from DB on creating auction: ', { error: error })
            return null
        }   
    }

    async updateAuction(userId: string, auctionId: string, updatedAuction: UpdateAuctionRequest): Promise<boolean> {
        try {
            await this.docClient.update({
                TableName: this.auctionTable,
                Key: { "userId": userId, "auctionId": auctionId },
                ExpressionAttributeNames: { "#n": "name" },
                UpdateExpression: "set #n=:n, auctionState=:as",
                ExpressionAttributeValues: {
                    ':n': updatedAuction.name,
                    ':as': updatedAuction.auctionState
                }
            }).promise()
            logger.info('updated DB auction item: ', { auctionId: auctionId })
            return true
        }
        catch (error) {
            logger.error('error from DB on updating auction: ', { auctionId: auctionId, error: error })
            return false
        }
    }

    async deleteAuction(userId: string, auctionId: string): Promise<boolean>  {
        try {
            await this.docClient.delete({
                TableName: this.auctionTable,
                Key: { "userId": userId, "auctionId": auctionId }
            }).promise()
            logger.info('deleted from DB auction item: ', { auctionId: auctionId })
            return true
        }
        catch (error) {
            logger.error('error from DB on deleting auction: ', { auctionId: auctionId, error: error })
            return false
        }
    }

    async generateUploadUrl(userId: string, auctionId: string): Promise<string> {
        const signedURL: string = getUploadUrl(auctionId)
        logger.info('Upload URL: ', { signedURL: signedURL })

        try {
            const result = await this.docClient.update({
                TableName: this.auctionTable,
                Key: { "userId": userId, "auctionId": auctionId },
                UpdateExpression: "set attachmentUrl=:a",
                ExpressionAttributeValues: {
                    ':a': signedURL.split("?")[0]
                }
            }).promise()
            logger.info('result from DB on updating image URL: ', { result: result })
        }
        catch (error) {
            logger.error('error from DB on updating image URL: ', { error: error })
            throw new Error('URL for auction item could not be stored in DB')
        }
        return signedURL as string
    }
}

function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: parseInt(urlExpiration, 10)
    })
}
