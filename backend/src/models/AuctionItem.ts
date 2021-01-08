export interface AuctionItem {
  auctionId: string
  itemId: string
  itemUserId: string
  createdAt: string
  itemName: string
  bidValue?: number
  bidUserId?: string
  description?: string
  attachmentUrl?: string
}
