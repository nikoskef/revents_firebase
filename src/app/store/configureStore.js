import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { getFirestore, reduxFirestore } from "redux-firestore";
import thunk from "redux-thunk";
import rootReducer from "../reducers/rootReducer";
import { auth } from "../config/firebase";
import firebase from "../config/firebase";

export const configureStore = preloadedState => {
  const middlewares = [thunk.withExtraArgument({ auth, getFirestore, firebase })];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const storeEnhancers = [middlewareEnhancer];

  const composedEnhancer = composeWithDevTools(reduxFirestore(firebase)(...storeEnhancers));

  const store = createStore(rootReducer, preloadedState, composedEnhancer);

  return store;
};
