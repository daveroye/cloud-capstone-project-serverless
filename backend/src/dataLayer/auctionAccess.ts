import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Auction, AuctionState } from '../models/Auction'
import { getItems, createItem, updateItem, deleteItem, storeUploadUrl, getUploadUrl } from './accessUtils'
import { UpdateAuctionRequest } from '../requests/UpdateAuctionRequest'

const logger = createLogger('auctionAccess')

export class AuctionAccess {

    constructor(
        private readonly auctionTable = process.env.AUCTIONS_TABLE,
        private readonly indexName = process.env.AUCTION_INDEX_NAME,
        private readonly gsIndexName = process.env.AUCTION_GSI_NAME) {
    }

    async getAuctions(userId: string, auctionType: string): Promise<Auction[]> {
        logger.info('Getting all auction items for type', { auctionType: auctionType })

        let queryParams: DocumentClient.QueryInput = null
        // define query paramaters to be used to get all auction items including a key for pagination
        if (auctionType == "ALL") {
            queryParams = {
                TableName: this.auctionTable,
                IndexName: this.indexName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            }
        } else if (auctionType == "OPEN") {
            queryParams = {
                TableName: this.auctionTable,
                IndexName: this.gsIndexName,
                KeyConditionExpression: 'auctionState = :state',
                ExpressionAttributeValues: { ':state': AuctionState.OpenForItems }
            }
        }
        if (queryParams) {
            return await getItems(queryParams) as Auction[]
        } else {
            return null
        }
    }

    async createAuction(auction: Auction): Promise<Auction> {
        const putParams: DocumentClient.PutItemInput = {
            TableName: this.auctionTable,
            Item: auction
        }
        return (await createItem(putParams)) ? auction : null
    }

    async updateAuction(userId: string, auctionId: string, updatedAuction: UpdateAuctionRequest): Promise<boolean> {
        const updateParams: DocumentClient.UpdateItemInput = {
            TableName: this.auctionTable,
            Key: { "userId": userId, "auctionId": auctionId },
            ExpressionAttributeNames: { "#n": "name" },
            UpdateExpression: "set #n=:n, auctionState=:as",
            ExpressionAttributeValues: {
                ':n': updatedAuction.name,
                ':as': updatedAuction.auctionState
            }
        }
        return await updateItem(updateParams)
    }

    async deleteAuction(userId: string, auctionId: string): Promise<boolean> {
        const deleteParams: DocumentClient.DeleteItemInput = {
            TableName: this.auctionTable,
            Key: { "userId": userId, "auctionId": auctionId }
        }
        return await deleteItem(deleteParams)
    }

    async generateAuctionUploadUrl(userId: string, auctionId: string): Promise<string> {
        const signedURL: string = getUploadUrl(auctionId)
        logger.info('Upload URL: ', { signedURL: signedURL })

        const updateParams: DocumentClient.UpdateItemInput = {
            TableName: this.auctionTable,
            Key: { "userId": userId, "auctionId": auctionId },
            UpdateExpression: "set attachmentUrl=:a",
            ExpressionAttributeValues: {
                ':a': signedURL.split("?")[0]
            }
        }
        await storeUploadUrl(updateParams)

        return signedURL as string
    }
}
