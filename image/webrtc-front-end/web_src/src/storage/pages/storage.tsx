import { Box } from "@chakra-ui/react";
import React from "react";
import { SharedSpinner } from "../../core/components/shared-spinner";
import { SharedTable } from "../../core/components/shared-table";
import { VOLUME_LIST } from "../../core/services/apis";
import { useSharedRequest } from "../../core/services/shared-request";
import { NewVolume } from "../components/new-volume";
import { PersistentVolumeClaim, volumeListColumns } from "../models/volume";

export function Storage(): React.ReactElement {
  const [datasource, setDatasource] = React.useState<PersistentVolumeClaim[]>([]);

  const [volumeListState, getVolumeList] = useSharedRequest<null, null, PersistentVolumeClaim[]>();

  React.useEffect((): void => {
    getVolumeList(VOLUME_LIST, "GET", null, null, (data): void => {
      setDatasource(data ?? []);
    });
  }, []);

  return (
    <>
      {volumeListState.isLoading ? <SharedSpinner />
        : <>
          <Box mb="4">
            <NewVolume />
          </Box>
          <SharedTable columns={volumeListColumns} data={datasource} pageSize={1000} />
        </>
      }
    </>
  );
}
