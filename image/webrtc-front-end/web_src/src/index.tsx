import ReactDOM from "react-dom/client";
import { App } from "./app";
import { ChakraProvider } from "@chakra-ui/react";
import { HashRouter } from "react-router-dom";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <ChakraProvider>
    <HashRouter>
      <App />
    </HashRouter>
  </ChakraProvider>
);
