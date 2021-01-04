import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Popup
} from 'semantic-ui-react'

import { createAuction, deleteAuction, getAuctions, patchAuction } from '../api/auctions-api'
import Auth from '../auth/Auth'
import { Auction } from '../types/Auction'

interface AuctionsProps {
  auth: Auth
  history: History
}

interface AuctionsState {
  auctions: Auction[]
  newAuctionName: string
  loadingAuctions: boolean
}

export class Auctions extends React.PureComponent<AuctionsProps, AuctionsState> {
  state: AuctionsState = {
    auctions: [],
    newAuctionName: '',
    loadingAuctions: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newAuctionName: event.target.value })
  }

  onEditButtonClick = (auctionId: string) => {
    this.props.history.push(`/auctions/${auctionId}/edit`)
  }

  onAddItemButtonClick = (auctionId: string, auctionName: string) => {
    this.props.history.push(`/auctions/${auctionId}/addItem/${auctionName}`)
  }

  onAuctionCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newAuction = await createAuction(this.props.auth.getIdToken(), {
        name: this.state.newAuctionName
      })
      this.setState({
        auctions: [...this.state.auctions, newAuction],
        newAuctionName: ''
      })
    } catch {
      alert('Auction creation failed')
    }
  }

  onAuctionDelete = async (auctionId: string) => {
    try {
      await deleteAuction(this.props.auth.getIdToken(), auctionId)
      this.setState({
        auctions: this.state.auctions.filter(auction => auction.auctionId != auctionId)
      })
    } catch {
      alert('Auction deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const auctions = await getAuctions(this.props.auth.getIdToken())
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
        <Header as="h1">Auctions</Header>

        {this.renderCreateAuctionInput()}

        {this.renderAuctions()}
      </div>
    )
  }

  renderCreateAuctionInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New auction',
              onClick: this.onAuctionCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Happytime Elementary Fundraiser..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
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
      <Grid padded>
        {this.state.auctions.map((auction, pos) => {
          return (
            <Grid.Row key={auction.auctionId}>
              <Grid.Column width={12} verticalAlign="middle">
                {auction.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
              <Popup content="Add items to this auction" trigger={
                <Button
                  icon
                  color="green"
                  onClick={() => this.onAddItemButtonClick(auction.auctionId, auction.name)}
                >
                  <Icon name="pencil" />
                </Button>}/>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
              <Popup content="Add an image to this auction" trigger={
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(auction.auctionId)}
                >
                  <Icon name="image" />
                </Button>}/>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Popup content="Delete auction" trigger={
                <Button
                  icon
                  color="red"
                  onClick={() => this.onAuctionDelete(auction.auctionId)}
                >
                  <Icon name="delete" />
                </Button>}/>
              </Grid.Column>
              {auction.attachmentUrl && (
                <Image src={auction.attachmentUrl} size="small" wrapped />
              )}
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
