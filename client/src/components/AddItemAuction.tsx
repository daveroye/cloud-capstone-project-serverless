import * as React from 'react'
import { History } from 'history'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Popup,
  Label
} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getAuctionItems, createAuctionItem, deleteAuctionItem } from '../api/auctions-api'
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
  loadingAuctionItems: boolean
}

export class AddItemAuction extends React.PureComponent<
  AddItemAuctionProps,
  AddItemAuctionState
> {
  state: AddItemAuctionState = {
    auctionItems: [],
    newAuctionItemName: '',
    loadingAuctionItems: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newAuctionItemName: event.target.value })
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/auctions/${this.props.match.params.auctionId}/${itemId}/edit`)
  }

  onAuctionItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newAuctionItem = await createAuctionItem(
        this.props.auth.getIdToken(), 
        this.props.match.params.auctionId, 
        { name: this.state.newAuctionItemName })
      this.setState({
        auctionItems: [...this.state.auctionItems, newAuctionItem],
        newAuctionItemName: ''
      })
    } catch {
      alert('Auction item creation failed')
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
      const auctionItems = await getAuctionItems(this.props.auth.getIdToken(), this.props.match.params.auctionId)
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
        <Header as="h1">{this.props.match.params.auctionName} Auction Items</Header>

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
              onClick: this.onAuctionItemCreate
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
                content='No Auction Items yet for this auction'
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
      <Grid padded>
        {this.state.auctionItems.map((auctionItem, pos) => {
          return (
            <Grid.Row key={auctionItem.itemId}>
              <Grid.Column width={14} verticalAlign="middle">
                {auctionItem.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
              <Popup content="Add an image to this auction item" trigger={
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(auctionItem.itemId)}
                >
                  <Icon name="image" />
                </Button>}/>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Popup content="Delete auction item" trigger={
                <Button
                  icon
                  color="red"
                  onClick={() => this.onAuctionItemDelete(auctionItem.itemId)}
                >
                  <Icon name="delete" />
                </Button>}/>
              </Grid.Column>
              {auctionItem.attachmentUrl && (
                <Image src={auctionItem.attachmentUrl} size="small" wrapped />
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
