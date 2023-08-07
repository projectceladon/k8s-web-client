import {
  useDisclosure,
  Button, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Text,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  chakra
} from "@chakra-ui/react";
import { Formik, Form, Field, FieldInputProps, FormikProps } from "formik";
import React from "react";
import { ADD_VOLUME } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { createVolumeSchema } from "../models/schema";
import { PersistentVolumeClaim } from "../models/volume";

export function NewVolume(): React.ReactElement {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [addNewVolumeState, addNewVolume] = useSharedRequest<PersistentVolumeClaim, null, null>();

  const onSubmit = (values: PersistentVolumeClaim): void => {
    addNewVolume(ADD_VOLUME, "POST", values, null, (): void => {
      onClose();
      window.location.reload();
    });
  };

  return (
    <>
      <Button colorScheme="blue" onClick={onOpen}>New volume</Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered={true}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New volume</ModalHeader>
          <ModalCloseButton />
          <Formik initialValues={{ name: "", size: "1" }} validationSchema={createVolumeSchema} onSubmit={onSubmit}>
            {({ errors, touched }): React.ReactNode => (
              <Form>
                <ModalBody>
                  <Field name="name">
                    {({ field }: { field: FieldInputProps<React.Key> }): React.ReactNode => (
                      <FormControl mb="5">
                        <FormLabel>Volume name</FormLabel>
                        <Input
                          {...field}
                          isInvalid={!!errors.name && touched.name}
                          autoComplete="off"
                          placeholder="Input your custom volume name"
                        />
                        {errors.name && touched.name && <Text color="red">{errors.name}</Text>}
                      </FormControl>
                    )}
                  </Field>
                  <Field name="size">
                    {({ field, form }: { field: FieldInputProps<React.Key>, form: FormikProps<React.Key>}): React.ReactNode => (
                      <FormControl mb="5">
                        <FormLabel>Size <chakra.span color="gray.400">(GB)</chakra.span></FormLabel>
                        <NumberInput
                          {...field}
                          isInvalid={!!errors.size && touched.size}
                          min={1}
                          onChange={(value): void => form.setFieldValue(field.name, value)}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        {errors.size && touched.size && <Text color="red">{errors.size}</Text>}
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
                    isLoading={addNewVolumeState.isLoading}
                    loadingText="Create new volume"
                  >
                    Create new volume
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
