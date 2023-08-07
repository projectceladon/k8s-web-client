import { SHARED_REQUEST_LOADING, SHARED_REQUEST_LOADED, SHARED_REQUEST_FAIL } from "../models/action-types";

interface SharedRequestLoading {
  type: typeof SHARED_REQUEST_LOADING;
}

interface SharedRequestLoaded {
  type: typeof SHARED_REQUEST_LOADED;
}

interface SharedRequestFailed {
  type: typeof SHARED_REQUEST_FAIL;
}

export const sharedRequestLoading = (): SharedRequestActions => ({
  type: SHARED_REQUEST_LOADING
});

export const sharedRequestLoaded = (): SharedRequestActions => ({
  type: SHARED_REQUEST_LOADED
});

export const sharedRequestFail = (): SharedRequestActions => ({
  type: SHARED_REQUEST_FAIL
});

export type SharedRequestActions = SharedRequestLoading | SharedRequestLoaded | SharedRequestFailed;
