import * as React from 'react'
import { History } from 'history'
import {
  Divider,
  Grid,
  Header,
  Image,
  Loader,
  Label
} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getAuctionItems } from '../api/auctions-api'
import { AuctionItem } from '../types/AuctionItem'

interface AuctionResultsProps {
  match: {
    params: {
      auctionId: string
      auctionName: string
    }
  }
  history: History
  auth: Auth
}

interface AuctionResultsState {
  auctionItems: AuctionItem[]
  loadingAuctionItems: boolean
}

export class AuctionResults extends React.PureComponent<
AuctionResultsProps,
  AuctionResultsState
  > {
  state: AuctionResultsState = {
    auctionItems: [],
    loadingAuctionItems: true
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
        <Header color='olive' as="h1">Items For: <i>{this.props.match.params.auctionName}</i></Header>
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
                content='No Auction Item Results were Found for this Auction'
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
                <Label>
                  Winning Bid ${auctionItem.bidValue}
                </Label>
                <Label>
                  Winning Bidder's Email: {auctionItem.bidUserId}
                </Label>
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
