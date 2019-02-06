import React, { Component } from "react";
import { connect } from "react-redux";
import { withFirestore, firebaseConnect, isEmpty } from "react-redux-firebase";
import { toastr } from "react-redux-toastr";
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
import LoadingComponent from "../../../app/layout/LoadingComponent";

class EventDetailedPage extends Component {
  state = {
    initialLoading: true
  };
  async componentDidMount() {
    const { firestore, match } = this.props;
    let event = await firestore.get(`events/${match.params.id}`);
    if (!event.exists) {
      toastr.error("Not Found", "This is not the event you are looking for");
      this.props.history.push("/error");
    }
    await firestore.setListener(`events/${match.params.id}`);
    this.setState({
      initialLoading: false
    });
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
      openModal,
      requesting,
      match
    } = this.props;

    const attendees =
      event &&
      event.attendees &&
      objectToArray(event.attendees).sort(function(a, b) {
        return a.joinDate - b.joinDate;
      });
    const isHost = event.hostUid === auth.uid;
    const isGoing = attendees && attendees.some(a => a.id === auth.uid);
    const chatTree = !isEmpty(eventChat) && createDataTree(eventChat);
    const authenticated = auth.isLoaded && !auth.isEmpty;
    const loadingEvent = requesting[`events/${match.params.id}`];

    if (loadingEvent || this.state.initialLoading) return <LoadingComponent inverted={true} />;

    return (
      <Grid>
        <Grid.Column mobile={16} tablet={16} computer={10}>
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
        <Grid.Column mobile={16} tablet={8} computer={6}>
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

  if (event === undefined) {
    event = {};
  }

  // if (state.firestore.ordered.events && state.firestore.ordered.events[0]) {
  //   event = state.firestore.ordered.events[0];
  // }

  return {
    requesting: state.firestore.status.requesting,
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
  firebaseConnect(
    props => props.auth.isLoaded && !props.auth.isEmpty && [`event_chat/${props.match.params.id}`]
  )
)(EventDetailedPage);
