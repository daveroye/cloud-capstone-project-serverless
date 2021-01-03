import { AuctionState } from './Auction'

export interface UpdateAuctionRequest {
  name: string
  auctionState: AuctionState
}