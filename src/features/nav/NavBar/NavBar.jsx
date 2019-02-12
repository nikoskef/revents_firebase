import React, { Component } from "react";
import { connect } from "react-redux";
import { withFirebase } from "react-redux-firebase";
import { Menu, Container, Button, Responsive } from "semantic-ui-react";
import { NavLink, Link, withRouter } from "react-router-dom";
import SignedOutMenu from "../Menus/SignedOutMenu";
import SignedInMenu from "../Menus/SignedInMenu";
import { openModal } from "../../modals/modalActions";
import SidebarExampleSidebar from "./Sidebar";

class NavBar extends Component {
  state = { visible: false };

  handleShowClick = () => this.setState({ visible: true });
  handleSidebarHide = () => this.setState({ visible: false });

  handleSignIn = () => {
    this.props.openModal("LoginModal");
  };

  handleRegister = () => {
    this.props.openModal("RegisterModal");
  };

  handleSignOut = () => {
    this.props.firebase.logout();
    this.props.history.push("/");
  };

  render() {
    const { auth, profile, children } = this.props;
    const authenticated = auth.isLoaded && !auth.isEmpty;

    return (
      <SidebarExampleSidebar
        visible={this.state.visible}
        handleSidebarHide={this.handleSidebarHide}
      >
        <Menu inverted fixed="top">
          <Container>
            <Responsive as={Menu.Item} minWidth={768}>
              <Menu.Item as={Link} to="/" header>
                <img src="/assets/logo.png" alt="logo" />
                Re-vents
              </Menu.Item>
              <Menu.Item as={NavLink} to="/events" name="Events" />

              {authenticated && <Menu.Item as={NavLink} to="/people" name="People" />}
              {authenticated && (
                <Menu.Item>
                  <Button
                    as={Link}
                    to="/createEvent"
                    floated="right"
                    positive
                    inverted
                    content="Create Event"
                  />
                </Menu.Item>
              )}
            </Responsive>
            <Responsive as={Menu.Item} maxWidth={767}>
              {authenticated ? (
                <Button icon="bars" onClick={this.handleShowClick} />
              ) : (
                <React.Fragment>
                  <Menu.Item as={Link} to="/" header>
                    <img src="/assets/logo.png" alt="logo" />
                  </Menu.Item>
                  <Menu.Item as={NavLink} to="/events" name="Events" />
                </React.Fragment>
              )}
            </Responsive>
            {authenticated ? (
              <SignedInMenu auth={auth} profile={profile} signOut={this.handleSignOut} />
            ) : (
              <SignedOutMenu signIn={this.handleSignIn} register={this.handleRegister} />
            )}
          </Container>
        </Menu>
        {children}
      </SidebarExampleSidebar>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.firebase.auth,
  profile: state.firebase.profile
});

const actions = {
  openModal
};

export default withRouter(
  withFirebase(
    connect(
      mapStateToProps,
      actions
    )(NavBar)
  )
);
