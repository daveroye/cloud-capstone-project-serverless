import * as uuid from 'uuid'
import { AuctionItem } from '../models/AuctionItem'
import { AuctionItemAccess } from '../dataLayer/auctionItemAccess'
import { CreateAuctionItemRequest } from '../requests/CreateAuctionItemRequest'
import { UpdateAuctionItemRequest } from '../requests/UpdateAuctionItemRequest'

const auctionAccess = new AuctionItemAccess()

export async function getAuctionItems(auctionId: string, userId: string, filterType: string): Promise<AuctionItem[]> {
    return auctionAccess.getAuctionItems(auctionId, userId, filterType)
}

export async function createAuctionItem(
    newAuction: CreateAuctionItemRequest,
    auctionId: string,
    itemUserId: string
): Promise<AuctionItem> {

    const itemId = uuid.v4()

    return await auctionAccess.createAuctionItem({
        auctionId: auctionId,
        itemId: itemId,
        itemUserId: itemUserId,
        createdAt: new Date().toISOString(),
        itemName: newAuction.itemName
    })
}

export async function udpateAuctionItem(
    updatedAuctionItem: UpdateAuctionItemRequest,
    auctionId: string,
    itemId: string
    ): Promise<boolean>  {
    return await auctionAccess.updateAuctionItem(
        auctionId, 
        itemId,
        updatedAuctionItem)
}

export async function deleteAuctionItem(auctionId: string, itemId: string): Promise<boolean> {
    return await auctionAccess.deleteAuctionItem(auctionId, itemId) as boolean
}

export async function generateAuctionItemUploadUrl(auctionId: string, itemId: string): Promise<string> {
    return await auctionAccess.generateAuctionItemUploadUrl(auctionId, itemId)
}
