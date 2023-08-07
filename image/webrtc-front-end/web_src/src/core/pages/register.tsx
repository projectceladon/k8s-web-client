import {
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormControlOptions,
  FormLabel,
  Input,
  Link,
  Switch,
  Text
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React from "react";
import { useNavigate } from "react-router";
import { registerSchema } from "../models/schema";
import { UserRegister } from "../models/user";
import { USER_REGISTER } from "../services/apis";
import { useSharedRequest } from "../services/shared-request";
import {
  sharedFormBody,
  sharedFormBottom,
  sharedFormContainer
} from "../styles/shared.styles";

export function Register(): React.ReactElement {
  const navigate = useNavigate();

  const [registerState, register] = useSharedRequest<UserRegister, null, null>();

  React.useEffect((): void => {
    if (registerState.isSuccess) {
      navigate("/success");
    }
  }, [registerState.isSuccess]);

  return (
    <Container p="55px 15px 0" style={sharedFormContainer}>
      <Center fontSize="3xl" mb="4">Create an account</Center>
      <Box style={sharedFormBody}>
        <Formik
          initialValues={{ username: "", password: "", cpwd: "", nodeSelector: false }}
          validationSchema={registerSchema}
          onSubmit={(values) : Promise<void> => register(USER_REGISTER, "POST", values, null)}
        >
          {({ errors, touched }): React.ReactNode => (
            <Form>
              <Field name="username">
                {({ field }: { field: FormControlOptions }): React.ReactNode => (
                  <FormControl mb="5">
                    <FormLabel>Username</FormLabel>
                    <Input {...field} isInvalid={!!errors.username && touched.username} bg="white" autoComplete="off" />
                    {errors.username && touched.username && <Text color="red">{errors.username}</Text>}
                  </FormControl>
                )}
              </Field>
              <Field name="password">
                {({ field }: { field: FormControlOptions }): React.ReactNode => (
                  <FormControl mb="5">
                    <FormLabel>Password</FormLabel>
                    <Input
                      {...field}
                      isInvalid={!!errors.password && touched.password}
                      bg="white"
                      type="password"
                      autoComplete="off"
                    />
                    {errors.password && touched.password && <Text color="red">{errors.password}</Text>}
                  </FormControl>
                )}
              </Field>
              <Field name="cpwd">
                {({ field }: { field: FormControlOptions }): React.ReactNode => (
                  <FormControl mb="5">
                    <FormLabel>Confirm password</FormLabel>
                    <Input {...field} isInvalid={!!errors.cpwd && touched.cpwd} bg="white" type="password" autoComplete="off" />
                    {errors.cpwd && touched.cpwd && <Text color="red">{errors.cpwd}</Text>}
                  </FormControl>
                )}
              </Field>
              <Field name="nodeSelector">
                {({ field }: { field: FormControlOptions }): React.ReactNode => (
                  <FormControl display="flex" alignItems="center" mb="5">
                    <FormLabel htmlFor="node-selector" mb="0">
                      nodeSelector
                    </FormLabel>
                    <Switch {...field} />
                  </FormControl>
                )}
              </Field>
              <Button
                w="100%"
                colorScheme="blue"
                type="submit"
                loadingText="Create account"
                isLoading={registerState.isLoading}
              >
                Create account
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
      <Box style={sharedFormBottom}>
        <Link href="/" color="blue.500">Back to sign in</Link>
      </Box>
    </Container>
  );
}
