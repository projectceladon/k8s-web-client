import { Box } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { hiddenOverflow } from "../styles/shared.styles";
import { Header } from "./header";

export function Private({ children }: { children: React.ReactElement }): React.ReactElement {
  const loaction = useLocation();

  return (
    <>
      <Header />
      <Box
        p={loaction.pathname === "/image" ? "0" : "20px"}
        style={loaction.pathname === "/image" ? hiddenOverflow : undefined}
      >
        {children}
      </Box>
    </>
  );
}
