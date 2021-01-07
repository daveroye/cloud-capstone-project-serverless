import { History } from 'history'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
  Popup
} from 'semantic-ui-react'

import { getAuctions } from '../api/auctions-api'
import Auth from '../auth/Auth'
import { Auction, AuctionState } from '../types/Auction'

interface OpenAuctionsProps {
  auth: Auth
  history: History
}

interface OpenAuctionsState {
  auctions: Auction[]
  loadingAuctions: boolean
}

export class OpenAuctions extends React.PureComponent<OpenAuctionsProps, OpenAuctionsState> {
  state: OpenAuctionsState = {
    auctions: [],
    loadingAuctions: true
  }

  onAddItemButtonClick = async (
    auctionId: string,
    auctionName: string) => {
    this.props.history.push(`/auctions/${auctionId}/addItem/${auctionName}`)
  }

  async componentDidMount() {
    try {
      const auctions = await getAuctions(this.props.auth.getIdToken(), "OPEN")
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
        <Header as="h1">Open Auctions</Header>
        {this.renderAuctions()}
      </div>
    )
  }

  renderAuctions() {
    if (this.state.loadingAuctions) {
      return this.renderLoading()
    }
    return this.renderAuctionsList()
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
          if (auction.auctionState == AuctionState.OpenForItems) {
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
                  <Popup content="Add or update your items for this auction" trigger={
                    <Button
                      icon
                      color="green"
                      onClick={() => this.onAddItemButtonClick(
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
