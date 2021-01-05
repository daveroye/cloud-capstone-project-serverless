import * as uuid from 'uuid'
import { Auction, AuctionState } from '../models/Auction'
import { AuctionAccess } from '../dataLayer/auctionAccess'
import { CreateAuctionRequest } from '../requests/CreateAuctionRequest'
import { UpdateAuctionRequest } from '../requests/UpdateAuctionRequest'

const auctionAccess = new AuctionAccess()

export async function getAuctions(userId: string, auctionType: string): Promise<Auction[]> {
    return auctionAccess.getAuctions(userId, auctionType)
}

export async function createAuction(
    newAuction: CreateAuctionRequest,
    userId: string
): Promise<Auction> {

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
    return await auctionAccess.generateAuctionUploadUrl(userId, auctionId)
}
