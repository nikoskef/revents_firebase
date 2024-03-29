import { toastr } from "react-redux-toastr";
import { FETCH_EVENTS } from "./eventConstants";
import { asyncActionStart, asyncActionFinish, asyncActionError } from "../async/asyncActions";
import { createNewEvent } from "../../app/common/utils/helpers";
import compareAsc from "date-fns/compareAsc";

export const createEvent = (event, firestore) => {
  return async (dispatch, getState, { firebase }) => {
    const user = firebase.auth().currentUser;
    const photoURL = getState().firebase.profile.photoURL;
    let newEvent = createNewEvent(user, photoURL, event);
    try {
      let createdEvent = await firestore.add(`events`, newEvent);
      await firestore.set(`event_attendee/${createdEvent.id}_${user.uid}`, {
        eventId: createdEvent.id,
        userUid: user.uid,
        eventDate: new Date(event.date),
        host: true
      });
      toastr.success("Success!", "Event has been created");
    } catch (error) {
      toastr.error("Oops", "Something went wrong");
    }
  };
};

export const updateEvent = event => {
  return async (dispatch, getState, { firebase }) => {
    dispatch(asyncActionStart());
    const firestore = firebase.firestore();
    event.date = new Date(event.date);
    try {
      let eventDocRef = firestore.collection("events").doc(event.id);
      let dateEqual = compareAsc(getState().firestore.ordered.events[0].date.toDate(), event.date);
      if (dateEqual !== 0) {
        let batch = firestore.batch();
        await batch.update(eventDocRef, event);

        let eventAttendeeRef = firestore.collection("event_attendee");
        let eventAttendeeQuery = await eventAttendeeRef.where("eventId", "==", event.id);
        let eventAttendeeQuerySnap = await eventAttendeeQuery.get();

        for (let evt of eventAttendeeQuerySnap.docs) {
          let eventAttendeeDocRef = await firestore.collection("event_attendee").doc(evt.id);

          await batch.update(eventAttendeeDocRef, {
            eventDate: event.date
          });
        }

        await batch.commit();
      } else {
        await eventDocRef.update(event);
      }

      dispatch(asyncActionFinish());
      toastr.success("Success!", "Event has been updated");
    } catch (error) {
      dispatch(asyncActionError());
      toastr.error("Oops", "Something went wrong");
    }
  };
};

export const cancelToggle = (cancelled, eventId, firestore) => async (dispatch, getState) => {
  const message = cancelled
    ? "Are you sure you want to cancelled the event?"
    : "This will reactivate the event - are you sure?";
  try {
    toastr.confirm(message, {
      onOk: () =>
        firestore.update(`events/${eventId}`, {
          cancelled: cancelled
        })
    });
  } catch (error) {
    console.log(error);
  }
};

export const getEventsForDashboard = lastEvent => async (dispatch, getState, { firebase }) => {
  let today = new Date(Date.now());
  const firestore = firebase.firestore();
  const eventsRef = firestore.collection("events");

  try {
    dispatch(asyncActionStart());
    let startAfter =
      lastEvent &&
      (await firestore
        .collection("events")
        .doc(lastEvent.id)
        .get());
    let query;

    lastEvent
      ? (query = eventsRef
          .where("date", ">=", today)
          .orderBy("date")
          .startAfter(startAfter)
          .limit(2))
      : (query = eventsRef
          .where("date", ">=", today)
          .orderBy("date")
          .limit(2));

    let querySnap = await query.get();

    if (querySnap.docs.length === 0) {
      dispatch(asyncActionFinish());
      return querySnap;
    }

    let events = [];

    for (let event of querySnap.docs) {
      let evt = { ...event.data(), id: event.id };
      events.push(evt);
    }
    dispatch({ type: FETCH_EVENTS, payload: { events } });
    dispatch(asyncActionFinish());
    return querySnap;
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
  }
};

export const addEventComment = (eventId, values, parentId) => async (
  dispatch,
  getState,
  { firebase }
) => {
  const profile = getState().firebase.profile;
  const user = firebase.auth().currentUser;
  let newComment = {
    parentId: parentId,
    displayName: profile.displayName,
    photoURL: profile.photoURL || "/assets/user.png",
    uid: user.uid,
    text: values.comment,
    date: Date.now()
  };
  try {
    await firebase.push(`event_chat/${eventId}`, newComment);
  } catch (error) {
    console.log(error);
    toastr.error("Oops", "Problem adding comment");
  }
};
