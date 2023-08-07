import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Passport } from "../pages/passport";

export function RootLogin(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const [content, setContent] = React.useState(<></>);
  const { from }: any = location.state || { from: { pathname: "/test/running" } };

  React.useEffect((): void => {
    if (localStorage.getItem("android-cloud-user")) {
      navigate(from, { replace: true });
    } else {
      setContent(<Passport />);
    }
  }, []);

  return content;
}
