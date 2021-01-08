import { AuctionState } from '../models/Auction'

/**
 * Fields in a request to update a single auction item.
 */
export interface UpdateAuctionRequest {
  name: string
  auctionState: AuctionState
}