import React from "react";
import { Card, Grid, Header, Image, Segment, Menu } from "semantic-ui-react";

const UserDeteiledEvents = () => {
  return (
    <Grid.Column width={12}>
      <Segment attached>
        <Header icon="calendar" content="Events" />
        <Menu.Item name="All Events " active />
        <Menu.Item name="All Events " />
        <Menu.Item name="All Events " />
        <Menu.Item name="All Events " />
        <Menu.Item name="All Events " />
        <br />

        <Card.Group itemsPerRow={5}>
          <Card>
            <Image src={`/assets/categoryImages/drinks.jpg`} />
            <Card.Content>
              <Card.Header textAlign="center">Event Title</Card.Header>
              <Card.Meta textAlign="center">28 March 2018 at 10:00PM</Card.Meta>
            </Card.Content>
          </Card>
        </Card.Group>
      </Segment>
    </Grid.Column>
  );
};

export default UserDeteiledEvents;
