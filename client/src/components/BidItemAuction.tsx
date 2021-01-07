import * as React from 'react'
import { History } from 'history'
import update from 'immutability-helper'
import {
  Divider,
  Form,
  Grid,
  Header,
  Input,
  Image,
  Loader,
  Label
} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getAuctionItems, patchAuctionItem } from '../api/auctions-api'
import { AuctionItem } from '../types/AuctionItem'

interface BidItemAuctionProps {
  match: {
    params: {
      auctionId: string
      auctionName: string
    }
  }
  history: History
  auth: Auth
}

interface BidItemAuctionState {
  auctionItems: AuctionItem[]
  newBid: number
  newBidEmail: string
  loadingAuctionItems: boolean
  bidChanged: boolean
}

export class BidItemAuction extends React.PureComponent<
  BidItemAuctionProps,
  BidItemAuctionState
  > {
  state: BidItemAuctionState = {
    auctionItems: [],
    newBid: 0,
    newBidEmail: '',
    loadingAuctionItems: true,
    bidChanged: false
  }

  handleBidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBid: event.target.valueAsNumber, bidChanged: true })
  }

  handleBidEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBidEmail: event.target.value, bidChanged: true })
  }

  onBidChange = async (itemId: string, pos: number) => {
    if (this.state.bidChanged) {
      const updatedBid = 
        (this.state.newBid)?
          this.state.newBid:
          this.state.auctionItems[pos].bidValue
      const updatedBidEmail = 
        (this.state.newBidEmail)?
          this.state.newBidEmail:
          this.state.auctionItems[pos].bidUserId
      try {
        await patchAuctionItem(
          this.props.auth.getIdToken(),
          this.props.match.params.auctionId,
          itemId,
          {
            bidValue: updatedBid,
            bidUserId: updatedBidEmail
          })
        this.setState({
          bidChanged: false,
          auctionItems: update(this.state.auctionItems, {
            [pos]: { bidValue: { $set: updatedBid },
                     bidUserId: { $set: updatedBidEmail } }
          }),
          newBid: 0,
          newBidEmail: ''
        })

      } catch {
        alert('Auction item bid update failed')
      }
    }
  }

  async componentDidMount() {
    try {
      const auctionItems = await getAuctionItems(
        this.props.auth.getIdToken(), 
        this.props.match.params.auctionId,
        "NONE")
      this.setState({
        auctionItems,
        loadingAuctionItems: false
      })
    } catch (e) {
      alert(`Failed to fetch auction items: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header color='olive' as="h1">My Items For: <i>{this.props.match.params.auctionName}</i></Header>
        {this.renderAuctions()}
      </div>
    )
  }

  renderAuctions() {
    if (this.state.loadingAuctionItems) {
      return this.renderLoading()
    }
    if (this.state.auctionItems.length > 0) {
      return this.renderAuctionItemsList()
    } else {
      return (
        <Grid padded>
          <Grid.Row centered>
            <Grid.Column width={2}>
            </Grid.Column>
            <Grid.Column width={8}>
              <Label
                color='orange'
                size='big'
                content='No Auction Items found to bid on for this auction'
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      )
    }
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Auction Items
        </Loader>
      </Grid.Row>
    )
  }

  renderAuctionItemsList() {
    return (
      <Grid columns={4}>
        {this.state.auctionItems.map((auctionItem, pos) => {
          return (
            <Grid.Row key={auctionItem.itemId}>
              <Grid.Column width={3} verticalAlign="top" textAlign='left'>
                {auctionItem.itemName}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {auctionItem.attachmentUrl && (
                  <Image src={auctionItem.attachmentUrl} size="small" />
                )}
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="top">
                  <Label>
                    Description: <p>{auctionItem.description}</p>
                  </Label>
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
                <Form onSubmit={() => this.onBidChange(auctionItem.itemId, pos)}>
                  <Label>
                    Bid $:
                     <Input
                      type='number'
                      defaultValue={auctionItem.bidValue}
                      placeholder="10"
                      onChange={(e) => this.handleBidChange(e)}
                    />
                    Email:
                     <Input
                      type='email'
                      defaultValue={auctionItem.bidUserId}
                      placeholder="someone@yahoo.com"
                      onChange={(e) => this.handleBidEmailChange(e)}
                    />
                    <Label color='green'>
                      <Input type="submit" value="Change Bid" />
                    </Label>
                  </Label>
                </Form>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
