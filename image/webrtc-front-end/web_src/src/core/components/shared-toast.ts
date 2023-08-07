import { ToastId } from "@chakra-ui/react";

export function sharedToast(toast: any, msg: string, status: "error" | "success"): ToastId {
  return toast({
    title: msg,
    status,
    duration: 3000,
    isClosable: true,
    position: "top",
    variant: "subtle",
    containerStyle: {
      marginTop: 100
    }
  });
}
