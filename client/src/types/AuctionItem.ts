export interface AuctionItem {
  auctionId: string
  itemId: string
  itemUserId: string
  createdAt: string
  name: string
  forsale: boolean
  bidValue?: number
  bidUserId?: string
  description?: string
  attachmentUrl?: string
}
