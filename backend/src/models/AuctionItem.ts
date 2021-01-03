export enum AuctionState {
  Created = "CREATED",
  OpenForItems = "OPEN_FOR_ITEMS",
  Started = "STARTED",
  Ended = "ENDED",
  Closed = "CLOSED"
}

export interface AuctionItem {
  userId: string
  auctionId: string
  createdAt: string
  name: string
  auctionState: AuctionState
  attachmentUrl?: string
}
