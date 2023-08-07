import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure
} from "@chakra-ui/react";
import { Field, FieldInputProps, Form, Formik, FormikProps } from "formik";
import { OptionItem, VersionOriginalModel } from "../../core/models/shared";
import { Select } from "chakra-react-select";
import { androidRequestSchema } from "../models/schema";
import { useSharedRequest } from "../../core/services/shared-request";
import { AndroidRequestInfo, VersionModel } from "../models/android";
import { UserResponse } from "../../core/models/user";
import React from "react";
import { useNavigate } from "react-router";
import { sortAndroidList } from "../../utils/sort";
import { ANDROID_LIST, ANDROID_REQUEST_START } from "../../core/services/apis";

export function AnroidRequestModal(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();

  const [cu] = React.useState<UserResponse>(
    localStorage.getItem("android-cloud-user") && JSON.parse(localStorage.getItem("android-cloud-user")!)
  );
  const [datasource, setDatasource] = React.useState<VersionModel[]>([]);

  const [androidListState, getAndroidList] = useSharedRequest<null, null, VersionOriginalModel[]>();
  const [requestStartState, requestStart] = useSharedRequest<AndroidRequestInfo, null, string>();

  const androidOptions: OptionItem[] = datasource.map((item): OptionItem => {
    return { label: item.tag, value: item.tag };
  });

  const onSubmit = (values: { version: string; count: number }): void => {
    const payload: AndroidRequestInfo = {
      userId: cu.id,
      version: values.version,
      nodeType: values.version.split("-")[values.version.split("-").length - 1],
      count: values.count
    };

    requestStart(ANDROID_REQUEST_START, "POST", payload, null, (sessionId): void => {
      navigate(`/android/detail/${sessionId}`);
    });
  };

  return (
    <>
      <Button pl="8" pr="8" colorScheme="blue" onClick={onOpen}>New android request</Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New android request</ModalHeader>
          <ModalCloseButton />
          <Formik initialValues={{ version: "", count: 1 }} validationSchema={androidRequestSchema} onSubmit={onSubmit}>
            {({ errors, touched }): React.ReactNode => (
              <Form>
                <ModalBody>
                  <Field name="version">
                    {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                      <FormControl mb="5">
                        <FormLabel>Version</FormLabel>
                        <Select
                          {...field}
                          isInvalid={!!errors.version && touched.version}
                          isLoading={androidListState.isLoading}
                          isClearable={true}
                          isSearchable={false}
                          useBasicStyles={true}
                          options={androidOptions}
                          onMenuOpen={(): void => {
                            setDatasource([]);
                            getAndroidList(ANDROID_LIST, "GET", null, null, (data): void => {
                              setDatasource(
                                typeof data === "object"
                                  ? sortAndroidList(data.filter((item: VersionOriginalModel): boolean => item.tag !== "latest"))
                                  : []
                              );
                            });
                          }}
                          value={
                            androidOptions
                              ? androidOptions.find((option): boolean => option.value === field.value)
                              : ""
                          }
                          placeholder="Select a version to start request"
                          onChange={
                            (option): void => {
                              if (typeof option !== "string") {
                                form.setFieldValue(field.name, option?.value);
                              }
                            }
                          }
                        />
                        {errors.version && touched.version && <Text color="red">{errors.version}</Text>}
                      </FormControl>
                    )}
                  </Field>
                  <Field name="count">
                    {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key>}): React.ReactNode => (
                      <FormControl mb="5">
                        <FormLabel>Count</FormLabel>
                        <NumberInput
                          {...field}
                          min={1}
                          isInvalid={!!errors.count && touched.count}
                          onChange={(value): void => form.setFieldValue(field.name, value ? parseInt(value) : "")}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        {errors.count && touched.count && <Text color="red">{errors.count}</Text>}
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>
                <ModalFooter>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    type="submit"
                    mr={3}
                    isLoading={requestStartState.isLoading}
                    loadingText="Start request"
                  >
                    Start request
                  </Button>
                  <Button size="sm" onClick={onClose}>Close</Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </>
  );
}
