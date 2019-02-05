import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER,
  COUNTER_ACTION_STARTED,
  COUNTER_ACTION_FINISHED
} from "./testConstants";

const initialState = {
  data: 42,
  loading: false
};

const testReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return { ...state, data: state.data + 1 };

    case DECREMENT_COUNTER:
      return { ...state, data: state.data - 1 };

    case COUNTER_ACTION_STARTED:
      return { ...state, loading: true };

    case COUNTER_ACTION_FINISHED:
      return { ...state, loading: false };

    default:
      return state;
  }
};

export default testReducer;
