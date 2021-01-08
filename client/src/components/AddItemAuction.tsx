import * as React from 'react'
import { History } from 'history'
import update from 'immutability-helper'
import {
  Button,
  Divider,
  Form,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Popup,
  Label,
  TextArea
} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getAuctionItems, createAuctionItem, deleteAuctionItem, patchAuctionItem } from '../api/auctions-api'
import { AuctionItem } from '../types/AuctionItem'

interface AddItemAuctionProps {
  match: {
    params: {
      auctionId: string
      auctionName: string
    }
  }
  history: History
  auth: Auth
}

interface AddItemAuctionState {
  auctionItems: AuctionItem[]
  newAuctionItemName: string
  newDescription: string
  newBid: number
  loadingAuctionItems: boolean
  descriptionChanged: boolean
  bidChanged: boolean
}

export class AddItemAuction extends React.PureComponent<
  AddItemAuctionProps,
  AddItemAuctionState
  > {
  state: AddItemAuctionState = {
    auctionItems: [],
    newAuctionItemName: '',
    newBid: 0,
    newDescription: '',
    loadingAuctionItems: true,
    descriptionChanged: false,
    bidChanged: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newAuctionItemName: event.target.value })
  }

  handleDescriptionChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    this.setState({ newDescription: event.currentTarget.value, descriptionChanged: true })
  }

  handleBidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBid: event.target.valueAsNumber, bidChanged: true })
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/auctions/${this.props.match.params.auctionId}/${itemId}/edit`)
  }

  onAuctionItemCreate = async () => {
    try {
      const newAuctionItem = await createAuctionItem(
        this.props.auth.getIdToken(),
        this.props.match.params.auctionId,
        { itemName: this.state.newAuctionItemName })
      this.setState({
        auctionItems: [...this.state.auctionItems, newAuctionItem],
        newAuctionItemName: ''
      })
    } catch {
      alert('Auction item creation failed')
    }
  }

  onDescriptionChange = async (itemId: string, pos: number) => {
    if (this.state.descriptionChanged) {
      try {
        await patchAuctionItem(
          this.props.auth.getIdToken(),
          this.props.match.params.auctionId,
          itemId,
          {
            description: this.state.newDescription
          })
        this.setState({
          descriptionChanged: false,
          auctionItems: update(this.state.auctionItems, {
            [pos]: { description: { $set: this.state.newDescription } }
          }),
          newDescription: ''
        })

      } catch {
        alert('Auction item description update failed')
      }
    }
  }

  onBidChange = async (itemId: string, pos: number) => {
    if (this.state.bidChanged) {
      try {
        await patchAuctionItem(
          this.props.auth.getIdToken(),
          this.props.match.params.auctionId,
          itemId,
          {
            bidValue: this.state.newBid
          })
        this.setState({
          bidChanged: false,
          auctionItems: update(this.state.auctionItems, {
            [pos]: { bidValue: { $set: this.state.newBid } }
          }),
          newBid: 0
        })

      } catch {
        alert('Auction item bid update failed')
      }
    }
  }

  onAuctionItemDelete = async (itemId: string) => {
    try {
      await deleteAuctionItem(this.props.auth.getIdToken(), this.props.match.params.auctionId, itemId)
      this.setState({
        auctionItems: this.state.auctionItems.filter(auctionItems => auctionItems.itemId != itemId)
      })
    } catch {
      alert('Auction item deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const auctionItems = await getAuctionItems(
        this.props.auth.getIdToken(), 
        this.props.match.params.auctionId,
        "FOR_USER")
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
              content: 'New auction item',
              onClick: () => this.onAuctionItemCreate()
            }}
            fluid
            actionPosition="left"
            placeholder="Hand Mixer/Disco Ball light fixture..."
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
                content='You have added No Auction Items yet for this auction'
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
      <Grid columns={5}>
        {this.state.auctionItems.map((auctionItem, pos) => {
          return (
            <Grid.Row key={auctionItem.itemId}>
              <Grid.Column verticalAlign="top" textAlign='left'>
                {auctionItem.itemName}
              </Grid.Column>
              <Grid.Column verticalAlign="middle">
                {auctionItem.attachmentUrl && (
                  <Image src={auctionItem.attachmentUrl} size="small" />
                )}
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="top">
                <Form onSubmit={() => this.onDescriptionChange(auctionItem.itemId, pos)}>
                  <Label>Description:</Label>
                     <TextArea
                      type='text'
                      required
                      defaultValue={auctionItem.description}
                      placeholder="Almost new, barely used..."
                      onChange={(e) => this.handleDescriptionChange(e)}
                    />
                    <Label color='blue'>
                      <Input type="submit" value="Submit Changes" />
                    </Label>
                </Form>
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle">
                <Form onSubmit={() => this.onBidChange(auctionItem.itemId, pos)}>
                  <Label>Starting Bid $:</Label>
                     <Input
                      type='number'
                      required
                      min='1'
                      defaultValue={auctionItem.bidValue}
                      placeholder="10"
                      onChange={(e) => this.handleBidChange(e)}
                    />
                    <Label color='green'>
                      <Input type="submit" value="Change Bid" />
                    </Label>
                </Form>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                  <Popup content="Add an image to this auction item" trigger={
                    <Button
                      icon
                      color="blue"
                      onClick={() => this.onEditButtonClick(auctionItem.itemId)}
                    >
                      <Icon name="image" />
                    </Button>} />
                  <Popup content="Delete auction item" trigger={
                    <Button
                      icon
                      color="red"
                      onClick={() => this.onAuctionItemDelete(auctionItem.itemId)}
                    >
                      <Icon name="delete" />
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
