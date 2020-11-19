import { SET_ALERT, REMOVE_ALERT } from "../actions/types";
const initialState = [];

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT: //dispatch type
      return [...state, payload]; //return array with the payload
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload); //Filters through and returns all the alerts except the one that matches the payload
    default:
      return state;
  }
}
