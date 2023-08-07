import React from "react";
import { useLocation } from "react-router";

export function useQuery(): URLSearchParams {
  const { search } = useLocation();
  return React.useMemo((): URLSearchParams => new URLSearchParams(search), [search]);
}
