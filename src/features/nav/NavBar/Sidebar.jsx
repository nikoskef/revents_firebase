import React, { Component } from "react";
import { Icon, Menu, Segment, Sidebar } from "semantic-ui-react";
import { Link } from "react-router-dom";

class SidebarExampleSidebar extends Component {
  render() {
    const { children, visible, handleSidebarHide } = this.props;

    return (
      <div>
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            as={Menu}
            animation="overlay"
            icon="labeled"
            inverted
            onHide={handleSidebarHide}
            vertical
            visible={visible}
            width="thin"
          >
            <Menu.Item as={Link} to="/">
              <img src="/assets/logo.png" alt="logo" />
              Home
            </Menu.Item>
            <Menu.Item as={Link} to="/events">
              <Icon name="calendar" />
              Events
            </Menu.Item>
            <Menu.Item as={Link} to="/people">
              <Icon name="user" />
              People
            </Menu.Item>
          </Sidebar>

          <Sidebar.Pusher>
            <Segment basic>{children}</Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export default SidebarExampleSidebar;
