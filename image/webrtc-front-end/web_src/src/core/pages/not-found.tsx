import { Container, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import { useNavigate } from "react-router";

export function NotFound(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <Container p="14" centerContent={true}>
      <Text fontSize="4xl" fontWeight="bold">404</Text>
      <Text fontSize="4xl">Page not found</Text>
      <UnorderedList p="14">
        <ListItem>Go back to the{" "}
          <Link color="blue.500" onClick={(): void => navigate(-1)}>previous page</Link>
        </ListItem>
        <ListItem>Go to the <Link color="blue.500" href="/#/test/running">main page</Link></ListItem>
      </UnorderedList>
    </Container>
  );
}
