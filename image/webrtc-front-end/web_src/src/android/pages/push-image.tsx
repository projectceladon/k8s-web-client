import { Box, Button, Container, Divider, Flex, Input, ListItem, Stack, Text, UnorderedList } from "@chakra-ui/react";
import React from "react";
import { useParams } from "react-router-dom";
import { SharedSpinner } from "../../core/components/shared-spinner";
import { PRE_UPDATE, UPDATE_INFO, WS } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { useWebSocket } from "../../hooks/use-web-socket";

export function PushImage(): React.ReactElement {
  const { tag } = useParams<{ tag: string }>();

  const uri = `${WS}`;

  const [info, setInfo] = React.useState<string>("");
  const [name, setName] = React.useState<string>("");
  const [customTag, setCustomTag] = React.useState<string>("");
  const [consoleRes, setConsoleRes] = React.useState<string>("");
  const [data, setData] = React.useState<React.ReactNode>(null);

  const [getInfoState, getInfo] = useSharedRequest<null, null, string>();
  const [preUpdateState, preUpdate] = useSharedRequest<null, { name: string, able?: string }, string>();

  const handleReceivedMessage = (e: MessageEvent<string>): void => {
    setData(
      (d): React.ReactNode => {
        return (
          <dl>
            <dd>{d ?? d}</dd>
            <dd>{e.data}</dd>
          </dl>
        );
      }
    );
  };

  const handleType = (type: string, able?: string): void => {
    setConsoleRes("");
    let newTag = "";
    switch (type) {
    case "image-update":
      if (tag === "latest" && customTag) {
        newTag = `${customTag}-dg2`;
      } else if (tag === "latest" && !customTag) {
        newTag ="latest";
      } else if (tag !== "latest" && customTag) {
        newTag = `${customTag}-dg2`;
      } else if (tag !== "latest" && !customTag) {
        newTag = `${tag}-dg2`;
      }
      socket?.send(`image-update,${tag === "latest" ? "latest" : `${tag}-dg2`},${newTag}`);
      break;
    case "pre-update":
      preUpdate(PRE_UPDATE, "GET", null, { name, able }, (data): void => {
        setConsoleRes(data);

        getInfo(UPDATE_INFO, "GET", null, null, (data): void => {
          setInfo(data);
        });
      });
    }
  };

  const socket = useWebSocket(uri, handleReceivedMessage);

  React.useEffect((): void | (() => void | undefined) => {
    getInfo(UPDATE_INFO, "GET", null, null, (data): void => {
      setInfo(data);
    });
  }, []);

  React.useEffect((): void | (() => void | undefined) => {
    const timer = setInterval((): void => {
      socket?.send("");
    }, 15000);

    return (): void => clearInterval(timer);
  }, [socket]);

  return (
    <Container maxW="container.lg">
      <Flex
        justifyContent="space-around"
        p="6"
        whiteSpace="pre-wrap"
        borderWidth="1px"
        borderRadius="lg"
        h="362px"
        mb="4"
        overflow="auto"
      >
        <Box w="100%">{getInfoState.isLoading ? <SharedSpinner /> : info ? info : "No data"}</Box>
        <Divider orientation="vertical" />
        <UnorderedList w="100%" pl="6">
          <Text fontSize="2xl" mb="4">{tag === "latest" ? "New" : `${tag}-dg2`}</Text>
          <ListItem mb="4">
            <Flex>
              <Input
                id="name"
                size="sm"
                mr="5"
                autoComplete="off"
                placeholder="example: aic-proxy"
                onChange={(e): void => setName(e.target.value)}
              />
              <Stack direction={["column", "row"]} spacing={5}>
                <Button
                  size="sm"
                  w="full"
                  loadingText="Enable"
                  isLoading={preUpdateState.isLoading}
                  onClick={(): void => handleType("pre-update", "enable")}
                >
                  Enable
                </Button>
                <Button
                  w="full"
                  size="sm"
                  loadingText="Disable"
                  isLoading={preUpdateState.isLoading}
                  onClick={(): void => handleType("pre-update", "disable")}
                >
                  Disable
                </Button>
              </Stack>
            </Flex>
          </ListItem>
          <ListItem>
            <Flex alignItems="center">
              <Input
                id="custom-tag"
                size="sm"
                autoComplete="off"
                placeholder="Input your tag"
                defaultValue={tag === "latest" ? "" : tag}
                onChange={(e): void => setCustomTag(e.target.value)}
              />
              <Button pl="4" pr="4" ml="5" size="sm" onClick={(): void => handleType("image-update")}>Push image</Button>
            </Flex>
          </ListItem>
        </UnorderedList>
      </Flex>
      <Box p="6" borderWidth="1px" borderRadius="lg" h="500px">
        <Box
          p="3"
          whiteSpace="pre-wrap"
          bg="#2D2E2C"
          color="white"
          h="450px"
          w="100%"
          overflow="auto"
        >
          {consoleRes ? consoleRes : data ? data : "Output"}
        </Box>
      </Box>
    </Container>
  );
}
