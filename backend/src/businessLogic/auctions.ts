import * as uuid from 'uuid'
import { AuctionItem, AuctionState } from '../models/AuctionItem'
import { AuctionAccess } from '../dataLayer/auctionAccess'
import { CreateAuctionRequest } from '../requests/CreateAuctionRequest'
import { UpdateAuctionRequest } from '../requests/UpdateAuctionRequest'

const auctionAccess = new AuctionAccess()

export async function getAuctions(userId: string): Promise<AuctionItem[]> {
    return auctionAccess.getAuctions(userId)
}

export async function createAuction(
    newAuction: CreateAuctionRequest,
    userId: string
): Promise<AuctionItem> {

    const auctionId = uuid.v4()

    return await auctionAccess.createAuction({
        userId: userId,
        auctionId: auctionId,
        createdAt: new Date().toISOString(),
        name: newAuction.name,
        auctionState: AuctionState.Created
    })
}

export async function udpateAuction(
    updatedAuction: UpdateAuctionRequest,
    userId: string,
    auctionId: string): Promise<boolean>  {
    return await auctionAccess.updateAuction(userId, auctionId, updatedAuction)
}

export async function deleteAuction(userId: string, auctionId: string): Promise<boolean> {
    return await auctionAccess.deleteAuction(userId, auctionId) as boolean
}

export async function generateUploadUrl(userId: string, auctionId: string): Promise<string> {
    return await auctionAccess.generateUploadUrl(userId, auctionId)
}
