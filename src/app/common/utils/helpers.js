export const objectToArray = object => {
  if (object) {
    return Object.entries(object).map(e => Object.assign({ id: e[0] }, e[1]));
  }
};

export const createNewEvent = (user, photoURL, event) => {
  event.date = new Date(event.date);
  return {
    ...event,
    hostUid: user.uid,
    hostedBy: user.displayName,
    hostPhotoURL: photoURL || "/assets/user.png",
    created: Date.now(),
    attendees: {
      [user.uid]: {
        going: true,
        joinDate: Date.now(),
        photoURL: photoURL || "/assets/user.png",
        displayName: user.displayName,
        host: true
      }
    }
  };
};
