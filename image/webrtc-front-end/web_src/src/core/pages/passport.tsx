import {
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormControlOptions,
  FormLabel,
  Input,
  Link
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { useNavigate, useLocation } from "react-router";
import { UserRequest, UserResponse } from "../models/user";
import { USER_LOGIN } from "../services/apis";
import { useSharedRequest } from "../services/shared-request";
import {
  sharedFormBody,
  sharedFormBottom,
  sharedFormContainer
} from "../styles/shared.styles";

export function Passport(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginState, login] = useSharedRequest<UserRequest, null, UserResponse>();

  const { from }: any = location.state || { from: { pathname: "/test/running" } };

  const handleLogin = (values: { username: string; password: string }): void => {
    login(USER_LOGIN, "POST", values, null, (res): void => {
      localStorage.setItem("android-cloud-user", JSON.stringify(res));
      navigate(from, { replace: true });
    });
  };

  return (
    <Container p="105px 15px 0" style={sharedFormContainer}>
      <Center fontSize="3xl" mb="4">Android Cloud</Center>
      <Box style={sharedFormBody}>
        <Formik
          initialValues={{ username: "", password: "" }}
          onSubmit={handleLogin}
        >
          {(): React.ReactNode => (
            <Form>
              <Field name="username">
                {({ field }: { field: FormControlOptions }): React.ReactNode => (
                  <FormControl mb="5">
                    <FormLabel>Username</FormLabel>
                    <Input {...field} bg="white" autoComplete="off" />
                  </FormControl>
                )}
              </Field>
              <Field name="password">
                {({ field }: { field: FormControlOptions }): React.ReactNode => (
                  <FormControl mb="5">
                    <FormLabel>Password</FormLabel>
                    <Input {...field} bg="white" type="password" autoComplete="off" />
                  </FormControl>
                )}
              </Field>
              <Button
                w="100%"
                colorScheme="blue"
                type="submit"
                loadingText="Sign in"
                isLoading={loginState.isLoading}
              >
                Sign in
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
      <Box style={sharedFormBottom}>
        New to Client? <Link href="/#/register" color="blue.500">Create an account</Link>
      </Box>
    </Container>
  );
}
