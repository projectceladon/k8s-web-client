import { SHARED_REQUEST_FAIL, SHARED_REQUEST_LOADED, SHARED_REQUEST_LOADING } from "../models/action-types";
import { SharedRequestActions } from "./shared-request-actions";

export interface SharedRequestState {
  isLoading: boolean;
  isSuccess: boolean;
}

export const initialSharedRequestState: SharedRequestState = {
  isLoading: false,
  isSuccess: false
};

export function sharedRequestReducer(
  state: SharedRequestState = initialSharedRequestState, action: SharedRequestActions
): SharedRequestState {
  switch (action.type) {
  case SHARED_REQUEST_LOADING:
    return {
      ...state,
      isLoading: true,
      isSuccess: false
    };
  case SHARED_REQUEST_LOADED:
    return {
      ...state,
      isLoading: false,
      isSuccess: true
    };
  case SHARED_REQUEST_FAIL:
    return {
      ...state,
      isLoading: false,
      isSuccess: false
    };
  default:
    return state;
  }
}
