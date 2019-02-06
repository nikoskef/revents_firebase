import React, { Component } from "react";
import { connect } from "react-redux";
import { withFirestore, firebaseConnect, isEmpty } from "react-redux-firebase";
import { compose } from "redux";
import { Grid } from "semantic-ui-react";
import EventDetailedHeader from "./EventDetailedHeader";
import EventDetailedInfo from "./EventDetailedInfo";
import EventDetailedChat from "./EventDetailedChat";
import EventDetailedSidebar from "./EventDetailedSidebar";
import { objectToArray, createDataTree } from "../../../app/common/utils/helpers";
import { goingToEvent, cancelGoingToEvent } from "../../user/userActions";
import { addEventComment } from "../eventActions";
import { openModal } from "../../modals/modalActions";

class EventDetailedPage extends Component {
  async componentDidMount() {
    const { firestore, match } = this.props;
    await firestore.setListener(`events/${match.params.id}`);
  }

  async componentWillUnmount() {
    const { firestore, match } = this.props;
    await firestore.unsetListener(`events/${match.params.id}`);
  }

  render() {
    const {
      event,
      auth,
      goingToEvent,
      cancelGoingToEvent,
      addEventComment,
      eventChat,
      loading,
      openModal
    } = this.props;
    const attendees = event && event.attendees && objectToArray(event.attendees);
    const isHost = event.hostUid === auth.uid;
    const isGoing = attendees && attendees.some(a => a.id === auth.uid);
    const chatTree = !isEmpty(eventChat) && createDataTree(eventChat);
    const authenticated = auth.isLoaded && !auth.isEmpty;
    return (
      <Grid>
        <Grid.Column width={10}>
          <EventDetailedHeader
            loading={loading}
            event={event}
            isHost={isHost}
            isGoing={isGoing}
            goingToEvent={goingToEvent}
            cancelGoingToEvent={cancelGoingToEvent}
            authenticated={authenticated}
            openModal={openModal}
          />
          <EventDetailedInfo event={event} />
          {authenticated && (
            <EventDetailedChat
              addEventComment={addEventComment}
              eventId={event.id}
              eventChat={chatTree}
            />
          )}
        </Grid.Column>
        <Grid.Column width={6}>
          <EventDetailedSidebar attendees={attendees} />
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let event = {};
  const eventId = ownProps.match.params.id;

  if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
    event = state.firestore.ordered.events.find(event => event.id === eventId);
  }

  return {
    event,
    auth: state.firebase.auth,
    loading: state.async.loading,
    eventChat:
      !isEmpty(state.firebase.data) &&
      objectToArray(state.firebase.data.event_chat[ownProps.match.params.id])
  };
};

const actions = {
  goingToEvent,
  cancelGoingToEvent,
  addEventComment,
  openModal
};

export default compose(
  withFirestore,
  connect(
    mapStateToProps,
    actions
  ),
  firebaseConnect(props => [`event_chat/${props.match.params.id}`])
)(EventDetailedPage);
