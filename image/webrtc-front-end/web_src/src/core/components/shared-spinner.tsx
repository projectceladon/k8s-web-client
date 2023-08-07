import { Center, Spinner } from "@chakra-ui/react";

export function SharedSpinner(): React.ReactElement {
  return (
    <Center>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size="xl"
      />
    </Center>
  );
}
