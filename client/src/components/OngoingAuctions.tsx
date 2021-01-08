import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Label,
  Loader,
  Popup
} from 'semantic-ui-react'

import { getAuctions } from '../api/auctions-api'
import Auth from '../auth/Auth'
import { Auction, AuctionState } from '../types/Auction'

interface OngoingAuctionsProps {
  auth: Auth
  history: History
}

interface OngoingAuctionsState {
  auctions: Auction[]
  loadingAuctions: boolean
}

export class OngoingAuctions extends React.PureComponent<OngoingAuctionsProps, OngoingAuctionsState> {
  state: OngoingAuctionsState = {
    auctions: [],
    loadingAuctions: true
  }

  onBidButtonClick = async (
    auctionId: string,
    auctionName: string) => {
    this.props.history.push(`/auctions/${auctionId}/bidItem/${auctionName}`)
  }

  async componentDidMount() {
    try {
      const auctions = await getAuctions(this.props.auth.getIdToken(), "STARTED")
      this.setState({
        auctions,
        loadingAuctions: false
      })
    } catch (e) {
      alert(`Failed to fetch auctions: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Ongoing Auctions</Header>
        {this.renderAuctions()}
      </div>
    )
  }

  renderAuctions() {
    if (this.state.loadingAuctions) {
      return this.renderLoading()
    }
    if (this.state.auctions.length > 0) {
      return this.renderAuctionsList()
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
                content='There are NO Currently Running Auctions'
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
          Loading Auctions
        </Loader>
      </Grid.Row>
    )
  }

  renderAuctionsList() {
    return (
      <Grid columns={3}>
        {this.state.auctions.map((auction, pos) => {
          if (auction.auctionState == AuctionState.Started) {
            return (
              <Grid.Row key={auction.auctionId}>
                <Grid.Column width={15} verticalAlign="top">
                  {auction.name}
                </Grid.Column>
                <Grid.Column verticalAlign="middle">
                {auction.attachmentUrl && (
                  <Image src={auction.attachmentUrl} size="small" wrapped />
                )}
                </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Popup content="Bid on items for this auction" trigger={
                    <Button
                      icon
                      color="green"
                      onClick={() => this.onBidButtonClick(
                        auction.auctionId,
                        auction.name)}
                    >
                      <Icon name="pencil" />
                    </Button>} />
                </Grid.Column>
                <Grid.Column width={16}>
                  <Divider />
                </Grid.Column>
              </Grid.Row>
            )
          }
        })}
      </Grid>
    )
  }
}
