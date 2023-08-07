import {
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useToast
} from "@chakra-ui/react";
import { Formik, Form, Field, FieldInputProps, FormikProps } from "formik";
import { Select } from "chakra-react-select";
import React from "react";
import { useNavigate } from "react-router";
import { OptionItem, VersionOriginalModel } from "../../core/models/shared";
import { InfoIcon } from "@chakra-ui/icons";
import {
  configsToolTips,
  configsOptions,
  fpsOptions,
  resolutionOptions,
  monopolizeOptions,
  TestStartPayload,
  NODE_TYPES
} from "../models/test";
import { initialTestRequestValues, testRequestSchema, TestStartForm } from "../models/schema";
import axios from "axios";
import { sharedToast } from "../../core/components/shared-toast";
import { useSharedRequest } from "../../core/services/shared-request";
import { UserResponse } from "../../core/models/user";
import { PersistentVolumeClaim } from "../../storage/models/volume";
import { VersionModel } from "../../android/models/android";
import { sortAndroidList, sortTestList } from "../../utils/sort";
import { CHECK_VOLUME_AVAILABLE, TEST_START, TEST_LIST, ANDROID_LIST, VOLUME_LIST } from "../../core/services/apis";

export function NewTestRequest(): React.ReactElement {
  const navigate = useNavigate();
  const toast = useToast();

  const [testListState, getTestList] = useSharedRequest<null, null, VersionOriginalModel[]>();
  const [androidListState, getAndroidList] = useSharedRequest<null, null, VersionOriginalModel[]>();
  const [volumeListState, getVolumeList] = useSharedRequest<null, null, PersistentVolumeClaim[]>();
  const [testStartState, testStart] = useSharedRequest<TestStartPayload, null, string>();

  const [countDisable, setCountDisable] = React.useState(false);
  const [monopolizeDisable, setMonopolizeDisable] = React.useState(true);
  const [testData, setTestData] = React.useState<VersionOriginalModel[]>([]);
  const [androidData, setAndroidData] = React.useState<VersionModel[]>([]);
  const [volumeData, setVolumeData] = React.useState<PersistentVolumeClaim[]>([]);

  const [cu] = React.useState<UserResponse>(
    localStorage.getItem("android-cloud-user") && JSON.parse(localStorage.getItem("android-cloud-user")!)
  );

  const volumeOptions: OptionItem[] = [{ label: "None", value: "" }].concat(volumeData.map((item): OptionItem => {
    return { label: item.name, value: item.name };
  }));

  const androidOptions: OptionItem[] = androidData.map((item): OptionItem => {
    return { label: item.tag, value: item.tag };
  });

  const testOptions: OptionItem[] = testData.map((item): OptionItem => {
    return { label: item.tag, value: item.tag };
  });

  const handlecheckVolumeAvailable = (form: FormikProps<React.Key>, value?: string): void => {
    if (value) {
      setCountDisable(true);
      form.setFieldValue("count", 1);
    } else {
      setCountDisable(false);
    }
  };

  const handleVolumeOnChange = (form: FormikProps<React.Key>, value?: string): void => {
    if (!value) {
      setMonopolizeDisable(true);
      setCountDisable(false);
      form.setFieldValue("shareDataMonopolize", "");
    } else {
      setMonopolizeDisable(false);

      axios(`${CHECK_VOLUME_AVAILABLE}/${value}`).catch((error): void => {
        form.setFieldValue("shareDataMonopolize", "");
        setCountDisable(false);
        setMonopolizeDisable(true);

        if (volumeData.filter((item): boolean => item.name === value)[0]?.access_mode === "ReadWriteOnce" ) {
          form.setFieldValue("shareDataPVC", "");
          sharedToast(toast, error.response?.data ? error.response?.data : error.message, "error");
        }
      });
    }
  };

  const onSubmit = (values: TestStartForm): void => {
    const payload: TestStartPayload = {
      userId: cu.id,
      sessionName: values.sessionName,
      androidVersion: values.androidVersion,
      testVersion: values.testVersion,
      count: values.count,
      nodeType: NODE_TYPES.some((n): boolean => n === values.androidVersion.split("-").pop())
        ? values.androidVersion.split("-").pop()!
        : "default",
      hevcEnable: values.configs?.includes("hevc") ? "true" : "false",
      logCapture: values.configs?.includes("logs") ? "true" : "",
      icrStartImmediately: values.configs?.includes("force-encoding") ? "true" : "",
      testParameters: values.configs?.includes("keep-instances")
        ? `aic-devops-retain-instances=true${values.testParameters ? " " + values.testParameters : ""}`
        : values.testParameters,
      nodeSelector: cu.nodeSelector ? cu.username : "",
      fps: values.fps,
      resolutionX: values.resolution !== "" ? values.resolution?.split("x")[0] : "",
      resolutionY: values.resolution !== "" ? values.resolution?.split("x")[1] : "",
      shareDataPVC: values.shareDataPVC,
      shareDataMonopolize: values.shareDataMonopolize
    };

    testStart(TEST_START, "POST", payload, null, (sessionId): void => {
      navigate(`/test/detail/${sessionId}`);
    });
  };

  return (
    <Container maxW="container.lg">
      <Formik
        initialValues={initialTestRequestValues}
        validationSchema={testRequestSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched }): React.ReactNode => (
          <Form>
            <Text fontWeight="bold" fontSize="14px" color="gray.500">Required</Text>
            <Divider mb={4} />
            <Field name="sessionName">
              {({ field }: { field: FieldInputProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Session Name</FormLabel>
                  <Input
                    {...field}
                    isInvalid={!!errors.sessionName && touched.sessionName}
                    autoComplete="off"
                    placeholder="Input your custom session name"
                  />
                  {errors.sessionName && touched.sessionName && <Text color="red">{errors.sessionName}</Text>}
                </FormControl>
              )}
            </Field>
            <Field name="testVersion">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Test Version</FormLabel>
                  <Select
                    {...field}
                    isInvalid={!!errors.testVersion && touched.testVersion}
                    isLoading={testListState.isLoading}
                    isClearable={true}
                    isSearchable={false}
                    useBasicStyles={true}
                    options={testOptions}
                    onMenuOpen={(): void => {
                      setTestData([]);
                      getTestList(TEST_LIST, "GET", null, null, (data): void => {
                        typeof data === "object" ? setTestData(sortTestList(data)) : [];
                      });
                    }}
                    value={
                      testOptions
                        ? testOptions.find((option): boolean => option.value === field.value)
                        : ""
                    }
                    placeholder="Select a test version to test"
                    onChange={
                      (option): void => {
                        if (typeof option !== "string") {
                          form.setFieldValue(field.name, option?.value);
                        }
                      }
                    }
                  />
                  {errors.testVersion && touched.testVersion && <Text color="red">{errors.testVersion}</Text>}
                </FormControl>
              )}
            </Field>
            <Field name="androidVersion">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Android Version</FormLabel>
                  <Select
                    {...field}
                    isInvalid={!!errors.androidVersion && touched.androidVersion}
                    isLoading={androidListState.isLoading}
                    isClearable={true}
                    isSearchable={false}
                    useBasicStyles={true}
                    options={androidOptions}
                    onMenuOpen={(): void => {
                      setAndroidData([]);
                      getAndroidList(ANDROID_LIST, "GET", null, null, (data): void => {
                        setAndroidData(
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
                    placeholder="Select an android version to test"
                    onChange={
                      (option): void => {
                        if (typeof option !== "string") {
                          form.setFieldValue(field.name, option?.value);
                        }
                      }
                    }
                  />
                  {errors.androidVersion && touched.androidVersion && <Text color="red">{errors.androidVersion}</Text>}
                </FormControl>
              )}
            </Field>
            <Field name="count">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key>}): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Count</FormLabel>
                  <NumberInput
                    {...field}
                    isInvalid={!!errors.count && touched.count}
                    isDisabled={countDisable}
                    min={1}
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
            <Text fontWeight="bold" fontSize="14px" color="gray.500">Optional</Text>
            <Divider mb={4} />
            <Field name="shareDataPVC">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Shared Data PVC</FormLabel>
                  <Select
                    {...field}
                    isLoading={volumeListState.isLoading}
                    isSearchable={false}
                    useBasicStyles={true}
                    options={volumeOptions}
                    onMenuOpen={(): void => {
                      setVolumeData([]);
                      getVolumeList(VOLUME_LIST, "GET", null, null, (data): void => {
                        setVolumeData(data ?? []);
                      });
                    }}
                    value={
                      volumeOptions
                        ? volumeOptions.find((option): boolean => option.value === field.value)
                        : ""
                    }
                    placeholder="Select a share data PVC"
                    onChange={
                      (option): void => {
                        if (typeof option !== "string") {
                          form.setFieldValue(field.name, option?.value);
                          handleVolumeOnChange(form, option?.value);
                        }
                      }
                    }
                  />
                  {errors.shareDataPVC && touched.shareDataPVC && <Text color="red">{errors.shareDataPVC}</Text>}
                </FormControl>
              )}
            </Field>
            <Field name="shareDataMonopolize">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Shared Data Monopolize</FormLabel>
                  <Select
                    {...field}
                    isDisabled={monopolizeDisable}
                    isSearchable={false}
                    useBasicStyles={true}
                    options={monopolizeOptions}
                    value={
                      monopolizeOptions
                        ? monopolizeOptions.find((option): boolean => option.value === field.value)
                        : ""
                    }
                    onChange={
                      (option): void => {
                        if (typeof option !== "string") {
                          form.setFieldValue(field.name, option?.value);
                          handlecheckVolumeAvailable(form, option?.value);
                        }
                      }
                    }
                  />
                </FormControl>
              )}
            </Field>
            <Field name="configs">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <Flex alignItems="center" justifyContent="space-between">
                    <FormLabel>Configs</FormLabel>
                    <Tooltip placement="right" label={configsToolTips}>
                      <InfoIcon color="blue.400" h={5} w={5} mb={2} />
                    </Tooltip>
                  </Flex>
                  <Select
                    {...field}
                    isMulti={true}
                    isSearchable={false}
                    useBasicStyles={true}
                    options={configsOptions}
                    value={
                      configsOptions
                        ? configsOptions.find((option): boolean => option.value === field.value)
                        : ""
                    }
                    placeholder="Select an android version to test"
                    onChange={(option): void =>
                      form.setFieldValue(field.name, option.map((o): string => {
                        if (typeof o !== "string") {
                          return o?.value;
                        }
                        return "";
                      }))
                    }
                  />
                </FormControl>
              )}
            </Field>
            <Field name="testParameters">
              {({ field }: { field: FieldInputProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Test parameters</FormLabel>
                  <Textarea
                    {...field}
                    autoComplete="off"
                    placeholder="Input your test parameters"
                    size="md"
                    resize="vertical"
                  />
                </FormControl>
              )}
            </Field>
            <Field name="fps">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>FPS</FormLabel>
                  <Select
                    {...field}
                    isClearable={true}
                    isSearchable={false}
                    useBasicStyles={true}
                    options={fpsOptions}
                    value={
                      fpsOptions
                        ? fpsOptions.find((option): boolean => option.value === field.value)
                        : ""
                    }
                    placeholder="Select custom FPS"
                    onChange={
                      (option): void => {
                        if (typeof option !== "string") {
                          form.setFieldValue(field.name, option?.value);
                        }
                      }
                    }
                  />
                </FormControl>
              )}
            </Field>
            <Field name="resolution">
              {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key> }): React.ReactNode => (
                <FormControl mb="5">
                  <FormLabel>Resolution</FormLabel>
                  <Select
                    {...field}
                    isClearable={true}
                    isSearchable={false}
                    useBasicStyles={true}
                    options={resolutionOptions}
                    value={
                      resolutionOptions
                        ? resolutionOptions.find((option): boolean => option.value === field.value)
                        : ""
                    }
                    placeholder="Select custom resolution"
                    onChange={
                      (option): void => {
                        if (typeof option !== "string") {
                          form.setFieldValue(field.name, option?.value);
                        }
                      }
                    }
                  />
                </FormControl>
              )}
            </Field>
            <Stack direction={["column", "row"]} spacing={5} mb={8}>
              <Button
                type="submit"
                w="full"
                colorScheme="blue"
                isLoading={testStartState.isLoading}
                loadingText="Start request"
              >
                Start request
              </Button>
              <Button w="full" onClick={(): void => navigate(-1)}>Cancel</Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Container>
  );
}
