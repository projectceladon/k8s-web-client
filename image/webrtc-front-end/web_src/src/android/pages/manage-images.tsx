import { Box, Button, Heading, LinkBox, LinkOverlay, SimpleGrid } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router";
import { SharedSpinner } from "../../core/components/shared-spinner";
import { VersionOriginalModel } from "../../core/models/shared";
import { ANDROID_LIST } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { sharedTable } from "../../core/styles/shared.styles";
import { sortAndroidList } from "../../utils/sort";
import { VersionModel } from "../models/android";

export function ManageImages(): React.ReactElement {
  const navigate = useNavigate();

  const [datasource, setDatasource] = React.useState<VersionModel[]>([]);
  const [androidListState, getAndroidList] = useSharedRequest<null, null, VersionOriginalModel[]>();

  React.useEffect((): void => {
    setDatasource([]);
    getAndroidList(ANDROID_LIST, "GET", null, null, (data): void => {
      setDatasource(
        typeof data === "object"
          ? sortAndroidList(data.filter((item: VersionOriginalModel): boolean => item.tag !== "latest"))
          : []
      );
    });
  }, []);

  return (
    <>
      {androidListState.isLoading ? <SharedSpinner />
        : <>
          <Box mb="4">
            <Button colorScheme="blue" onClick={(): void => navigate("/android/push-image/latest")}>New image</Button>
          </Box>
          {!datasource.length && <div style={sharedTable}>No data</div>}
          <SimpleGrid minChildWidth="300px" spacing="20px">
            {datasource.map((item, i): React.ReactNode =>
              <LinkBox
                key={i}
                as="article"
                maxW="sm"
                p="5"
                borderWidth="1px"
                rounded="md"
                _hover={{ border: "1px solid", cursor: "pointer" }}
              >
                <Heading size="md" my="2">
                  <LinkOverlay href={`/#/android/push-image/${item.tag.replace("-dg2", "")}`}>
                    {item.tag}
                  </LinkOverlay>
                </Heading>
              </LinkBox>)}
          </SimpleGrid>
        </>
      }
    </>
  );
}
