import React from "react";
import axios, { AxiosResponse, CancelTokenSource } from "axios";
import { useToast } from "@chakra-ui/react";
import { sharedToast } from "../components/shared-toast";
import { initialSharedRequestState, sharedRequestReducer, SharedRequestState } from "../reducers/shared-request-reducer";
import { sharedRequestLoading, sharedRequestLoaded, sharedRequestFail } from "../reducers/shared-request-actions";

export const useSharedRequest = <T, P, V>(): [
  SharedRequestState,
  (
    api: string,
    method: "POST" | "DELETE" | "GET" | "PUT",
    formData: T,
    params: P,
    selfHandler?: (value: V) => void
  ) => Promise<void>
] => {
  const toast = useToast();
  const cancelTokenSource = React.useRef<CancelTokenSource>(axios.CancelToken.source());
  const [state, dispatch] = React.useReducer(sharedRequestReducer, initialSharedRequestState);

  const fetchData = async (
    api: string,
    method: "POST" | "DELETE" | "GET" | "PUT",
    formData: T,
    params: P,
    selfHandler?: (value: V) => void
  ): Promise<void> => {
    dispatch(sharedRequestLoading());

    await axios(api, { method, data: formData, params, cancelToken: cancelTokenSource.current.token })
      .then((res: AxiosResponse<V>): void => {
        dispatch(sharedRequestLoaded());
        selfHandler && selfHandler(res.data);
      })
      .catch((error): void => {
        dispatch(sharedRequestFail());
        error.message !== "canceled"
          && sharedToast(toast, error.response?.data ? <string>error.response?.data : error.message, "error");
      });
  };

  React.useEffect((): void | (() => void | undefined) => {
    return (): void => {
      cancelTokenSource.current.cancel();
    };
  }, []);

  return [state, fetchData];
};
