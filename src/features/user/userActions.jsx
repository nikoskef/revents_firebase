import { toastr } from "react-redux-toastr";
import cuid from "cuid";
import { asyncActionStart, asyncActionFinish, asyncActionError } from "../async/asyncActions";

export const updateProfile = user => async (dispatch, getState, { firebase }) => {
  const { isLoaded, isEmpty, ...updatedUser } = user;
  if (updatedUser.dateOfBirth) {
    updatedUser.dateOfBirth = +new Date(user.dateOfBirth);
  }

  try {
    await firebase.updateProfile(updatedUser);
    toastr.success("Success", "Profile updated");
  } catch (error) {
    console.log(error);
  }
};

export const uploadProfileImage = (file, fileName, firestore) => async (
  dispatch,
  getstate,
  { firebase }
) => {
  const user = firebase.auth().currentUser;
  const path = `${user.uid}/user_images/`;
  const imageName = cuid();

  try {
    dispatch(asyncActionStart());
    const storage = await firebase.storage();
    const Ref = await storage.ref();

    let uploadTask = await Ref.child(path + imageName).put(file);

    const downloadUrl = await uploadTask.ref.getDownloadURL();

    let userDoc = await firestore.get(`users/${user.uid}`);
    // check if user has photo, if not update profile with new image
    if (!userDoc.data().photoURL) {
      await firebase.updateProfile({
        photoURL: downloadUrl
      });
      await user.updateProfile({
        photoURL: downloadUrl
      });
    }
    // add the new photo to photos collection
    await firestore.add(
      {
        collection: "users",
        doc: user.uid,
        subcollections: [{ collection: "photos" }]
      },
      {
        name: imageName,
        url: downloadUrl
      }
    );
    dispatch(asyncActionFinish());
  } catch (error) {
    console.log(error);
    dispatch(asyncActionError());
    throw new Error("Problem uploading photo");
  }
};

export const deletePhoto = (photo, firestore) => async (dispatch, getState, { firebase }) => {
  const user = firebase.auth().currentUser;
  try {
    await firebase.deleteFile(`${user.uid}/user_images/${photo.name}`);
    await firestore.delete({
      collection: "users",
      doc: user.uid,
      subcollections: [{ collection: "photos", doc: photo.id }]
    });
  } catch (error) {
    console.log(error);
    throw new Error("Problem deleting the photo");
  }
};

export const setMainPhoto = photo => async (dispatch, getState, { firebase }) => {
  try {
    return await firebase.updateProfile({
      photoURL: photo.url
    });
  } catch (error) {
    console.log(error);
    throw new Error("Problem setting main photo");
  }
};

export const goingToEvent = (event, firestore) => async (dispatch, getState, { firebase }) => {
  const user = firebase.auth().currentUser;
  const photoURL = getState().firebase.profile.photoURL;
  const attendee = {
    going: true,
    joinDate: Date.now(),
    photoURL: photoURL || "/assets/user.png",
    displayName: user.displayName,
    host: false
  };
  try {
    await firestore.update(`events/${event.id}`, {
      [`attendees.${user.uid}`]: attendee
    });
    await firestore.set(`event_attendee/${event.id}_${user.uid}`, {
      eventId: event.id,
      userUid: user.uid,
      eventDate: event.date,
      host: false
    });
    toastr.success("Success", "You have signed up to the event");
  } catch (error) {
    console.log(error);
    toastr.error("Oops", "Problem signing up to event");
  }
};

export const cancelGoingToEvent = (event, firestore) => async (
  dispatch,
  getState,
  { firebase }
) => {
  const user = firebase.auth().currentUser;
  try {
    await firestore.update(`events/${event.id}`, {
      [`attendees.${user.uid}`]: firestore.FieldValue.delete()
    });
    await firestore.delete(`event_attendee/${event.id}_${user.uid}`);
    toastr.success("Success", "You have signed out from the event");
  } catch (error) {
    console.log(error);
    toastr.error("Oops", "Something went wrong");
  }
};
