import {
  Box,
  Flex,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Stack
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router";
import { UserResponse } from "../models/user";

export function Header(): React.ReactElement {
  const navigate = useNavigate();
  const [cu] = React.useState<UserResponse>(
    localStorage.getItem("android-cloud-user") && JSON.parse(localStorage.getItem("android-cloud-user")!)
  );

  const logout = (): void => {
    localStorage.setItem("android-cloud-user", "");
    navigate("/", { replace: true });
  };

  return (
    <Flex alignItems="center" bg="blackAlpha.800" p={4} h={74}>
      <Flex alignItems="center" color="white">
        <Box fontWeight="semibold" fontSize={20} ml="4">
          Android Cloud
        </Box>
        <Box fontWeight="semibold" fontSize={14} ml="3" mr="6">
          v2.7_0109
        </Box>
        <Stack direction={["column", "row"]} spacing="6">
          <Link href="/#/test/running">Test</Link>
          <Link href="/#/android">Android</Link>
          <Link href="/#/storage">Storage</Link>
        </Stack>
      </Flex>
      <Spacer />
      <Box>
        <Menu isLazy={true}>
          <MenuButton color="white" mr="4">{cu?.username}</MenuButton>
          <MenuList>
            <MenuItem onClick={logout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
}
