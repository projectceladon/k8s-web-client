import { SearchIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger
} from "@chakra-ui/react";

export function TextSearchFilter({
  column: { filterValue, setFilter }
}: { column: { filterValue: string; setFilter: (value?: string) => void } }): React.ReactElement {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton size="xs" aria-label="filter" icon={<SearchIcon />} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>
          <Input
            value={filterValue || ""}
            onChange={(e): void => setFilter(e.target.value || undefined)}
            placeholder={`Search...`}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
