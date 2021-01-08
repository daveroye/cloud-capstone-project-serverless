import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment } from 'semantic-ui-react'
import Auth from './auth/Auth'
import { EditAuction } from './components/EditAuction'
import { AddItemAuction } from './components/AddItemAuction'
import { BidItemAuction } from './components/BidItemAuction'
import { EditAuctionItem } from './components/AddImageAuctionItem'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Auctions } from './components/Auctions'
import { OpenAuctions } from './components/OpenAuctions'
import { OngoingAuctions } from './components/OngoingAuctions'
import { AuctionResults } from './components/AuctionResults'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">My Auctions</Link>
        </Menu.Item>
        <Menu.Item name="open_auctions">
          <Link to="/openAuctions">Open Auctions</Link>
        </Menu.Item>
        <Menu.Item name="ongoing_auctions">
          <Link to="/ongoingAuctions">Ongoing Auctions</Link>
        </Menu.Item>
        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Auctions {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/openAuctions"
          exact
          render={props => {
            return <OpenAuctions {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/ongoingAuctions"
          exact
          render={props => {
            return <OngoingAuctions {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/auctions/:auctionId/edit"
          exact
          render={props => {
            return <EditAuction {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/auctions/:auctionId/addItem/:auctionName"
          exact
          render={props => {
            return <AddItemAuction {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/auctions/:auctionId/auctionResults/:auctionName"
          exact
          render={props => {
            return <AuctionResults {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/auctions/:auctionId/bidItem/:auctionName"
          exact
          render={props => {
            return <BidItemAuction {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/auctions/:auctionId/:itemId/edit"
          exact
          render={props => {
            return <EditAuctionItem {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}
