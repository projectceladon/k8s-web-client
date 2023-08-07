import { SimpleGrid, Flex, Text, Box, Button } from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useQuery } from "../../utils/query";
import { ADBForward } from "../models/shared";
import { ADB_FORWARD, ADB_UNFORWARD, GET_ADB_FORWARD_STATUS } from "../services/apis";

export function AdbForward(): React.ReactElement {
  const query = useQuery();
  const sId = query.get("sId");
  const android = query.get("android");

  const [loading, setLoding] = React.useState(false);
  const [result, setResult] = React.useState<ADBForward>({ androidIp: "", targetIp: "", targetPort: "" });

  const handleForward = (): void => {
    setLoding(true);

    axios(`${ADB_FORWARD}/${sId}?android=${android}`)
      .then((res): void => {
        setResult(res.data);
        setLoding(false);
      })
      .catch((err): void => {
        setLoding(false);
        console.log(err.message);
      });
  };

  const handleUnforward = (): void => {
    setLoding(true);

    axios(`${ADB_UNFORWARD}/${sId}?android=${android}`)
      .then((): void => {
        setResult({ androidIp: "", targetIp: "", targetPort: "" });
        setLoding(false);
      })
      .catch((err): void => {
        setLoding(false);
        console.log(err.message);
      });
  };

  React.useEffect((): void | (() => void | undefined) => {
    setLoding(true);

    axios(`${GET_ADB_FORWARD_STATUS}/${sId}?android=${android}`)
      .then((res): void => {
        setResult(res.data);
        setLoding(false);
      })
      .catch((err): void => {
        setLoding(false);
        console.log(err.message);
      });
  }, [sId]);

  return (
    <>
      {Object.values(result).every((v): boolean => !!v)
        ? <Button mb={4} isLoading={loading} loadingText="UnForward" onClick={handleUnforward}>UnForward</Button>
        : <Button mb={4} isLoading={loading} loadingText="Forward" onClick={handleForward}>Forward</Button>}
      {Object.values(result).every((v): boolean => !!v)
      && <Box borderWidth="1px" borderRadius="12px" p="4" mb="4">
        <SimpleGrid minChildWidth="300px" spacing="40px">
          <Flex justifyContent="space-between">
            <Text>Android IP</Text>
            <Text color="gray.500">{result.androidIp}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Target IP</Text>
            <Text color="gray.500">{result.targetIp}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text>Target port</Text>
            <Text color="gray.500">{result.targetPort}</Text>
          </Flex>
        </SimpleGrid>
      </Box>}
    </>
  );
}
