import { Navigate, useLocation } from "react-router";
import { Private } from "./private";

export function PrivateRoute({ children }: { children: React.ReactElement }): React.ReactElement {
  const location = useLocation();

  if (!localStorage.getItem("android-cloud-user")) {
    return <Navigate to="/" state={{ from: location }} replace={true} />;
  }

  return <Private children={children} />;
}
