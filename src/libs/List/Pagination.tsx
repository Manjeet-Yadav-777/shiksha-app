import { Box, Button } from "@mantine/core";
import { Inline } from "../basic/Layout";
import {
  IconArrowLeft,
  IconArrowRight,
  IconSquareChevronDown,
} from "@tabler/icons-react";

export type PaginateProps = {
  /**
   * Total number of items to paginate over
   * @example 100
   */
  total: number;
  /**
   * First item's count number in the current list
   * @example 1
   */
  from: number;
  /**
   * Last item's count number in the current list
   * @example 10
   */
  to: number;
  /**
   * Current page number on the list
   * @example 1
   */
  currentPage: number;
  /**
   * Last possible page number
   * @example 10
   */
  lastPage: number;
  /**
   * Is fetching data so that we can disable the page navigation
   */
  isFetching: boolean;
  /**
   * Change handler for the pages
   */
  onChange: (page: number) => void;
  /**
   * Hide when not needed
   * @default true
   */
  autoHide?: boolean;
  previousPageLabel?: string;
  nextPageLabel?: string;
};

export function Paginate({
  total,
  from,
  to,
  currentPage,
  isFetching,
  lastPage,
  onChange,
  autoHide = true,
  previousPageLabel = "Previous",
  nextPageLabel = "Next",
  ...props
}: PaginateProps) {
  if (!total || (autoHide && lastPage <= 1 && currentPage <= 1)) return null;

  return (
    <Box {...props}>
      <Inline justify={"center"} gap={"md"}>
        <Button
          disabled={isFetching || currentPage <= 1}
          onClick={() => onChange(currentPage - 1)}
          title="Previous Page"
        >
          <IconArrowLeft rotate="90" /> {previousPageLabel}
        </Button>
        <Button
          disabled={isFetching || lastPage <= currentPage}
          onClick={() => onChange(currentPage + 1)}
          title="Next Page"
        >
          {nextPageLabel} <IconArrowRight rotate="90" />
        </Button>
      </Inline>
    </Box>
  );
}
