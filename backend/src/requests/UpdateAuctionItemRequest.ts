/**
 * Fields in a request to update a single auction item.
 */
export interface UpdateAuctionItemRequest {
  itemName: string
  bidValue: number
  bidUserId: string
  description: string
}