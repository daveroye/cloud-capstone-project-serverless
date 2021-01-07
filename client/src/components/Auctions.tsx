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
  Label,
  Loader,
  Popup
} from 'semantic-ui-react'

import { createAuction, deleteAuction, getAuctions, patchAuction } from '../api/auctions-api'
import Auth from '../auth/Auth'
import { Auction, AuctionState } from '../types/Auction'

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

  onAddItemButtonClick = async (
    pos: number,
    auctionId: string,
    auctionName: string,
    auctionState: AuctionState) => {
    if (auctionState == AuctionState.Created) {
      try {
        await patchAuction(
          this.props.auth.getIdToken(),
          auctionId,
          {
            name: auctionName,
            auctionState: AuctionState.OpenForItems
          })
        this.setState({
          auctions: update(this.state.auctions, {
            [pos]: { auctionState: { $set: AuctionState.OpenForItems } }
          })
        })
      } catch {
        alert('Auction update failed')
      }
    }
    this.props.history.push(`/auctions/${auctionId}/addItem/${auctionName}`)
  }

  onResultsButtonClick = async (
    pos: number,
    auctionId: string,
    auctionName: string,
    auctionState: AuctionState) => {
    if (auctionState == AuctionState.Ended) {
      try {
        await patchAuction(
          this.props.auth.getIdToken(),
          auctionId,
          {
            name: auctionName,
            auctionState: AuctionState.Closed
          })
        this.setState({
          auctions: update(this.state.auctions, {
            [pos]: { auctionState: { $set: AuctionState.Closed } }
          })
        })
      } catch {
        alert('Auction update failed')
      }
    }
    this.props.history.push(`/auctions/${auctionId}/auctionResults/${auctionName}`)
  }

  onStartButtonClick = async (
    pos: number,
    auctionId: string,
    auctionName: string,
    auctionState: AuctionState) => {
    if (auctionState == AuctionState.OpenForItems) {
      try {
        await patchAuction(
          this.props.auth.getIdToken(),
          auctionId,
          {
            name: auctionName,
            auctionState: AuctionState.Started
          })
        this.setState({
          auctions: update(this.state.auctions, {
            [pos]: { auctionState: { $set: AuctionState.Started } }
          })
        })
      } catch {
        alert('Auction update failed')
      }
    }
  }

  onStopButtonClick = async (
    pos: number,
    auctionId: string,
    auctionName: string,
    auctionState: AuctionState) => {
    if (auctionState == AuctionState.Started) {
      try {
        await patchAuction(
          this.props.auth.getIdToken(),
          auctionId,
          {
            name: auctionName,
            auctionState: AuctionState.Ended
          })
        this.setState({
          auctions: update(this.state.auctions, {
            [pos]: { auctionState: { $set: AuctionState.Ended } }
          })
        })
      } catch {
        alert('Auction update failed')
      }
    }
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
      const auctions = await getAuctions(this.props.auth.getIdToken(), "ALL")
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
                content='You Have Not Yet Created Any Auctions'
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
      <Grid columns={4}>
        {this.state.auctions.map((auction, pos) => {
          return (
            <Grid.Row key={auction.auctionId}>
              <Grid.Column verticalAlign="top">
                {auction.name}
              </Grid.Column>
              <Grid.Column verticalAlign="middle">
                {auction.attachmentUrl && (
                  <Image src={auction.attachmentUrl} size="medium" wrapped />
                )}
              </Grid.Column>
              <Grid.Column verticalAlign="top" textAlign='center'>
                {auction.auctionState}
              </Grid.Column>
              <Grid.Column width={1} floated="right" verticalAlign="top">
                <Popup content="Add items to this auction" trigger={
                  <Button
                    icon
                    color="orange"
                    disabled={!(auction.auctionState == AuctionState.Created || 
                                auction.auctionState == AuctionState.OpenForItems)}
                    onClick={() => this.onAddItemButtonClick(
                      pos,
                      auction.auctionId,
                      auction.name,
                      auction.auctionState)}
                  >
                    <Icon name="pencil" />
                  </Button>} />
                <Popup content="Add an image to this auction" trigger={
                  <Button
                    icon
                    color="blue"
                    disabled={!(auction.auctionState == AuctionState.Created || 
                                auction.auctionState == AuctionState.OpenForItems)}
                    onClick={() => this.onEditButtonClick(auction.auctionId)}
                  >
                    <Icon name="image" />
                  </Button>} />
                  <Popup content="Start this auction" trigger={
                  <Button
                    icon
                    color="green"
                    disabled={!(auction.auctionState == AuctionState.OpenForItems)}
                    onClick={() => this.onStartButtonClick(
                      pos,
                      auction.auctionId,
                      auction.name,
                      auction.auctionState)}
                  >
                    <Icon name="caret square right" />
                  </Button>} />
                  <Popup content="Stop this auction" trigger={
                  <Button
                    icon
                    color="red"
                    disabled={!(auction.auctionState == AuctionState.Started)}
                    onClick={() => this.onStopButtonClick(
                      pos,
                      auction.auctionId,
                      auction.name,
                      auction.auctionState)}
                  >
                    <Icon name="stop" />
                  </Button>} />
                <Popup content="Delete auction" trigger={
                  <Button
                    icon
                    color="red"
                    disabled={!(auction.auctionState == AuctionState.Created || 
                                auction.auctionState == AuctionState.OpenForItems ||
                                auction.auctionState == AuctionState.Closed)}
                    onClick={() => this.onAuctionDelete(auction.auctionId)}
                  >
                    <Icon name="delete" />
                  </Button>} />
                  <Popup content="See results of this auction" trigger={
                  <Button
                    icon
                    color="blue"
                    disabled={!(auction.auctionState == AuctionState.Ended)}
                    onClick={() => this.onResultsButtonClick(
                      pos,
                      auction.auctionId,
                      auction.name,
                      auction.auctionState)}
                  >
                    <Icon name="circle" />
                  </Button>} />
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
