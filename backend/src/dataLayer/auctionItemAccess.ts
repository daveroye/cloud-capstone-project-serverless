import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { AuctionItem } from '../models/AuctionItem'
import { getItems, createItem, updateItem, deleteItem, storeUploadUrl, getUploadUrl } from './accessUtils'
import { UpdateAuctionItemRequest } from '../requests/UpdateAuctionItemRequest'

const logger = createLogger('auctionItemAccess')

export class AuctionItemAccess {

    constructor(private readonly auctionItemTable = process.env.AUCTION_ITEMS_TABLE) { }

    async getAuctionItems(auctionId: string): Promise<AuctionItem[]> {
        logger.info('Getting all auction items')

        // define query paramaters to be used to get all auction items including a key for pagination
        const queryParams: DocumentClient.QueryInput =
        {
            TableName: this.auctionItemTable,
            KeyConditionExpression: 'auctionId = :auctionId',
            ExpressionAttributeValues: { ':auctionId': auctionId }
        }
        return await getItems(queryParams) as AuctionItem[]
    }

    async createAuctionItem(auctionItem: AuctionItem): Promise<AuctionItem> {
        const putParams: DocumentClient.PutItemInput = {
            TableName: this.auctionItemTable,
            Item: auctionItem
        }
        return (await createItem(putParams)) ? auctionItem : null
    }

    async updateAuctionItem(auctionId: string, itemId: string, updatedAuctionItem: UpdateAuctionItemRequest): Promise<boolean> {
        const updateParams: DocumentClient.UpdateItemInput = {
            TableName: this.auctionItemTable,
            Key: { "auctionId": auctionId, "itemId": itemId },
            ExpressionAttributeNames: { "#n": "name" },
            UpdateExpression: "set #n=:n, bid=:b",
            ExpressionAttributeValues: {
                ':n': updatedAuctionItem.name,
                ':b': updatedAuctionItem.bid
            }
        }
        return await updateItem(updateParams)
    }

    async deleteAuctionItem(auctionId: string, itemId: string): Promise<boolean> {
        const deleteParams: DocumentClient.DeleteItemInput = {
            TableName: this.auctionItemTable,
            Key: { "auctionId": auctionId, "itemId": itemId }
        }
        return await deleteItem(deleteParams)
    }

    async generateAuctionItemUploadUrl(auctionId: string, itemId: string): Promise<string> {
        const signedURL: string = getUploadUrl(itemId)
        logger.info('Upload URL: ', { signedURL: signedURL })

        const updateParams: DocumentClient.UpdateItemInput = {
            TableName: this.auctionItemTable,
            Key: { "auctionId": auctionId, "itemId": itemId },
            UpdateExpression: "set attachmentUrl=:a",
            ExpressionAttributeValues: {
                ':a': signedURL.split("?")[0]
            }
        }
        await storeUploadUrl(updateParams)

        return signedURL as string
    }
}
