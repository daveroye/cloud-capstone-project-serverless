import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { AuctionItem } from '../models/AuctionItem'
import { getItems, createItem, updateItem, deleteItem, storeUploadUrl, getUploadUrl } from './accessUtils'
import { UpdateAuctionItemRequest } from '../requests/UpdateAuctionItemRequest'

const logger = createLogger('auctionItemAccess')

export class AuctionItemAccess {

    constructor(private readonly auctionItemTable = process.env.AUCTION_ITEMS_TABLE) { }

    async getAuctionItems(auctionId: string, userId: string, filterType: string): Promise<AuctionItem[]> {
        let queryParams: DocumentClient.QueryInput
        if (filterType == "FOR_USER") {
            logger.info('Getting auction items for user: ', { userId: userId })

            // define query paramaters to be used to get auction items for user including a key for pagination
            queryParams =
            {
                TableName: this.auctionItemTable,
                KeyConditionExpression: 'auctionId = :auctionId',
                FilterExpression: 'itemUserId = :itemUserId',
                ExpressionAttributeValues: { ':auctionId': auctionId, ':itemUserId': userId }
            }
        }
        else if (filterType == "NONE") {
            // define query paramaters to be used to get all auction items including a key for pagination
            queryParams =
            {
                TableName: this.auctionItemTable,
                KeyConditionExpression: 'auctionId = :auctionId',
                ExpressionAttributeValues: { ':auctionId': auctionId }
            }

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

    async updateAuctionItem(
        auctionId: string,
        itemId: string,
        updatedAuctionItem: UpdateAuctionItemRequest
    ): Promise<boolean> {
        let updateParams: DocumentClient.UpdateItemInput
        if (updatedAuctionItem.description) {
            updateParams = {
                TableName: this.auctionItemTable,
                Key: { "auctionId": auctionId, "itemId": itemId },
                UpdateExpression: "set description=:d",
                ExpressionAttributeValues: {
                    ':d': updatedAuctionItem.description
                }
            }
        } else if (updatedAuctionItem.bidValue) {
            const bidEmail: string = (updatedAuctionItem.bidUserId)?updatedAuctionItem.bidUserId:'not given'
            updateParams = {
                TableName: this.auctionItemTable,
                Key: { "auctionId": auctionId, "itemId": itemId },
                UpdateExpression: "set bidValue=:b, bidUserId=:bu, forSale=:fs",
                ExpressionAttributeValues: {
                    ':b': updatedAuctionItem.bidValue,
                    ':bu': bidEmail,
                    ':fs': true
                }
            }
        }
        if (updatedAuctionItem) {
            return await updateItem(updateParams)
        } else {
            return false
        }
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
