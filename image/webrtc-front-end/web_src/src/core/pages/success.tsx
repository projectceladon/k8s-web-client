import { Button, Container, Icon, Text } from "@chakra-ui/react";
import { AiFillCheckCircle } from "react-icons/ai";
import { useNavigate } from "react-router";

export function Success(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <Container p="14" centerContent={true}>
      <Icon fontSize="5em" color="green.600" as={AiFillCheckCircle} />
      <Text mt="6" fontSize="4xl">Register Success</Text>
      <Button mt="6" colorScheme="blue" onClick={(): void => navigate("/")}>Continue</Button>
    </Container>
  );
}
