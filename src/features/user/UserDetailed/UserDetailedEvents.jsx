import React from "react";
import { Card, Grid, Header, Image, Segment, Tab } from "semantic-ui-react";
import { Link } from "react-router-dom";
import format from "date-fns/format";

const panes = [
  { menuItem: "All Events", pane: { key: "allEvents" } },
  { menuItem: "Past Events", pane: { key: "pastEvents" } },
  { menuItem: "Future Events", pane: { key: "futureEvents" } },
  { menuItem: "Hosting", pane: { key: "hosted" } }
];

const UserDeteiledEvents = ({ events, eventsLoading, changeTab }) => {
  return (
    <Grid.Column mobile={16} tablet={12} computer={12}>
      <Segment attached loading={eventsLoading}>
        <Header icon="calendar" content="Events" />
        <Tab
          onTabChange={(e, data) => changeTab(e, data)}
          panes={panes}
          menu={{ secondary: true, pointing: true, className: "wrapped" }}
        />
        <br />

        <Card.Group>
          {events &&
            events.map(event => (
              <Card as={Link} to={`/event/${event.id}`} key={event.id}>
                <Image src={`/assets/categoryImages/${event.category}.jpg`} />
                <Card.Content>
                  <Card.Header textAlign="center">{event.title}</Card.Header>
                  <Card.Meta textAlign="center">
                    {event.date && (
                      <React.Fragment>
                        <div>{format(event.date.toDate(), "d MMM u")}</div>
                        <div>{format(event.date.toDate(), "H:mm")}</div>
                      </React.Fragment>
                    )}
                  </Card.Meta>
                </Card.Content>
              </Card>
            ))}
        </Card.Group>
      </Segment>
    </Grid.Column>
  );
};

export default UserDeteiledEvents;
