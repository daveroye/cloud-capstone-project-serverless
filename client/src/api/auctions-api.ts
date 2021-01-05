import { apiEndpoint } from '../config'
import { Auction } from '../types/Auction';
import { AuctionItem } from '../types/AuctionItem';
import { CreateAuctionRequest } from '../types/CreateAuctionRequest';
import Axios from 'axios'
import { UpdateAuctionRequest } from '../types/UpdateAuctionRequest';

export async function getAuctions(
  idToken: string,
  auctionType: string
  ): Promise<Auction[]> {
  console.log('Fetching auctions')

  const response = await Axios.get(`${apiEndpoint}/auctions?auctionType=${auctionType}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Auctions:', response.data)
  return response.data.items
}

export async function getAuctionItems(
  idToken: string,
  auctionId: string
  ): Promise<AuctionItem[]> {
  console.log('Fetching auction items')

  const response = await Axios.get(`${apiEndpoint}/auctions/${auctionId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Auction items:', response.data)
  return response.data.items
}

export async function createAuction(
  idToken: string,
  newAuction: CreateAuctionRequest
): Promise<Auction> {
  const response = await Axios.post(`${apiEndpoint}/auctions`,  JSON.stringify(newAuction), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function createAuctionItem(
  idToken: string,
  auctionId: string,
  newAuction: CreateAuctionRequest
): Promise<AuctionItem> {
  const response = await Axios.post(`${apiEndpoint}/auctions/${auctionId}`,  JSON.stringify(newAuction), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchAuction(
  idToken: string,
  auctionId: string,
  updatedAuction: UpdateAuctionRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/auctions/${auctionId}`, JSON.stringify(updatedAuction), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteAuction(
  idToken: string,
  auctionId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/auctions/${auctionId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteAuctionItem(
  idToken: string,
  auctionId: string,
  itemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/auctions/${auctionId}/${itemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  auctionId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/auctions/${auctionId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function getItemUploadUrl(
  idToken: string,
  auctionId: string, 
  itemId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/auctions/${auctionId}/${itemId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
