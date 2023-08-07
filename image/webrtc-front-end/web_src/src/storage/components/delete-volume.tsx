import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure
} from "@chakra-ui/react";
import React, { LegacyRef } from "react";
import { CHECK_VOLUME_AVAILABLE, DELETE_VOLUME } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";

export function DeleteVolume(props: { name: string }): React.ReactElement {
  const { name } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteCheckState, deleteCheck] = useSharedRequest<null, null, null>();
  const [deleteVolumeState, deleteVolume] = useSharedRequest<null, null, null>();
  const cancelRef = React.useRef() as React.MutableRefObject<HTMLInputElement>;

  const handleDeleteCheck = (): void => {
    deleteCheck(`${CHECK_VOLUME_AVAILABLE}/${name}`, "GET", null, null);
  };

  const handleDeleteVolume = (): void => {
    deleteVolume(`${DELETE_VOLUME}/${name}`, "DELETE", null, null, (): void => {
      onClose();
      window.location.reload();
    });
  };

  React.useEffect((): void | (() => void | undefined) => {
    if (deleteCheckState.isSuccess) {
      onOpen();
    }
  }, [deleteCheckState.isSuccess]);

  return (
    <>
      <Button
        isLoading={deleteCheckState.isLoading}
        colorScheme="red"
        variant="link"
        onClick={handleDeleteCheck}
      >
        Delete
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered={true}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete volume
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure to delete this volume?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button size="sm" ref={cancelRef as LegacyRef<HTMLButtonElement> | undefined} onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={handleDeleteVolume}
                ml={3}
                isLoading={deleteVolumeState.isLoading}
                loadingText="Delete"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
