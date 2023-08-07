import { Box, Button, Checkbox, Flex, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { ChangeEvent } from "react";
import { BsUpload } from "react-icons/bs";
import { useQuery } from "../../utils/query";
import { FILE_INSTALL, FILE_UPLOAD } from "../services/apis";
import { sharedToast } from "./shared-toast";

export function FileUpload(): React.ReactElement {
  const toast = useToast();
  const query = useQuery();
  const hiddenFileInput = React.useRef<any>(null);
  const [check, setChecked] = React.useState(false);
  const [percent, setPercent] = React.useState(0);
  const [filename, setFilename] = React.useState("No file");

  const sId = query.get("sId");
  const install = `${FILE_INSTALL}?id=${sId}`;
  const upload = `${FILE_UPLOAD}?id=${sId}`;

  const handleCheckChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPercent(0);
    setChecked(event.target.checked);
  };

  const handleClick = (): void => {
    hiddenFileInput.current.click();
  };

  const beforeUpload = (file: any): boolean => {
    const isAPK = file.type === "application/vnd.android.package-archive";
    const nameCheck = new RegExp(/^[-_A-Za-z0-9.]+$/g).test(file.name);

    return (check ? isAPK : true) && nameCheck;
  };

  const handleUpload = async (event: any): Promise<void> => {
    setPercent(0);

    if (!beforeUpload(event.target.files[0])) {
      sharedToast(toast, "Incorrect file", "error");
      return;
    }

    const file = event.target.files[0];
    setFilename(file.name);

    const formData = new FormData();
    formData.append("file", file);

    await axios(check ? install : upload, {
      method: "POST",
      data: formData,
      onUploadProgress: (e: ProgressEvent): void => {
        setPercent(Math.round((e.loaded * 100) / e.total));
        sharedToast(toast, `${file.name} upload succeed`, "success");
      }
    }).catch((error): void => {
      sharedToast(toast, error.message, "error");
    });
  };

  return (
    <Box>
      <Flex mb={4}>
        <Checkbox mr={2} defaultChecked={false} onChange={handleCheckChange}>Install</Checkbox>
        <Text color="gray.400">(Default method is upload)</Text>
      </Flex>
      <Flex alignItems="center">
        <Button leftIcon={<BsUpload />} onClick={handleClick}>{check ? "Install" : "Upload"}</Button>
        <input type="file" ref={hiddenFileInput} onChange={handleUpload} style={{ display: "none" }} />
        <Text ml={4}>{filename}</Text>
        <Text ml={4}>{percent} %</Text>
      </Flex>
    </Box>
  );
}
