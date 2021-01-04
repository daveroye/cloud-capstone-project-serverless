export interface AuctionItem {
  auctionId: string
  itemId: string
  createdAt: string
  name: string
  bid: number
  forsale: boolean
  description?: string
  attachmentUrl?: string
}
