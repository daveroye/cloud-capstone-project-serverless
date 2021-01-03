import { AuctionState } from '../models/AuctionItem'

/**
 * Fields in a request to update a single auction item.
 */
export interface UpdateAuctionRequest {
  name: string
  auctionState: AuctionState
}