import { SubmissionError, reset } from "redux-form";
import { toastr } from "react-redux-toastr";
import { closeModal } from "../modals/modalActions";

export const login = creds => {
  return async (dispatch, getState, { auth }) => {
    try {
      await auth.signInWithEmailAndPassword(creds.email, creds.password);

      dispatch(closeModal());
    } catch (error) {
      console.log(error);
      throw new SubmissionError({
        _error: error.message // 'Login Error'
      });
    }
  };
};

export const registerUser = (user, ...rest) => async (dispatch, getState, { auth }) => {
  const firestore = rest[1].firestore;

  try {
    // create user
    let createdUser = await auth.createUserWithEmailAndPassword(user.email, user.password);
    // update auth profile
    await createdUser.user.updateProfile({
      displayName: user.displayName
    });
    // create a new profile in firestore
    let newUser = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: user.displayName,
      createdAt: +new Date()
    };

    await firestore.set(`users/${newUser.uid}`, { ...newUser });
    dispatch(closeModal());
  } catch (error) {
    console.log(error);
    throw new SubmissionError({
      _error: error.message // 'Register Error'
    });
  }
};

export const socialLogin = selectedProvider => async (dispatch, getState, { firebase }) => {
  try {
    dispatch(closeModal());
    await firebase.login({
      provider: selectedProvider,
      type: "popup"
    });
  } catch (error) {
    console.log(error);
  }
};

export const updatePassword = creds => async (dispatch, getState, { auth }) => {
  const user = auth.currentUser;
  try {
    await user.updatePassword(creds.newPassword1);
    await dispatch(reset("account"));
    toastr.success("Success", "Your password has been updated");
  } catch (error) {
    throw new SubmissionError({
      _error: error.message
    });
  }
};
