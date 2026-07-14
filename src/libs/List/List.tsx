import useSWR, { type SWRConfiguration } from "swr";
import { useState, type ReactNode } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react";
import { Button, Stack, Text } from "@mantine/core";
import type { IListResponse } from "../XHR/xhr";
import { Inline } from "../basic/Layout";

type ListViewProps<T> = {
  swrKey: string | unknown[];
  fetchFn: () => Promise<IListResponse<T>>;
  children: (
    data: T[],
    refresh: () => void,
    meta: IListResponse<T>["meta"],
  ) => ReactNode;
  params: any;
  sortOptions?: React.ReactNode;
  onParamsChange: (params: any) => void;
  swrConfig?: SWRConfiguration;
};

export function RefreshIcon({ refresh }: { refresh: () => void }) {
  const [rotated, setRotated] = useState(false);

  const handleClick = () => {
    refresh();
    setRotated((prev) => !prev);
  };

  return (
    <IconRefresh
      onClick={handleClick}
      className="!p-2 cursor-pointer Stack-Stack w-fit"
      style={{
        transition: "transform 0.3s ease",
        transform: `rotate(${rotated ? 360 : 0}deg)`,
      }}
    />
  );
}

export function ListView<T>({
  swrKey,
  fetchFn,
  children,
  params,
  swrConfig,
  onParamsChange,
  sortOptions,
}: ListViewProps<T>) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR([swrKey, params], fetchFn, swrConfig);

  console.log({ data, error, isLoading });

  if (isLoading) {
    return (
      <Stack p={"4"} h={"60vh"} justify="center" align="center">
        <Text c={"gray"}>Loading...</Text>
      </Stack>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Something went wrong</div>;
  }

  return (
    <Stack gap={10}>
      <Inline justify="space-between" align="center" className="!px-0">
        <Stack align="center" gap={5}>
          {!data?.data?.length ? null : (
            <Text fw={"inherit"}>
              {data.meta.last_page} results • Page {data.meta.current_page} of{" "}
              {data.meta.last_page}
            </Text>
          )}
        </Stack>
        {sortOptions && sortOptions}
      </Inline>
      {!data?.data?.length ? (
        <Stack
          p={"4"}
          fz={"h3"}
          c={"gray"}
          h={"60vh"}
          justify={"center"}
          align={"center"}
          gap={"2"}
        >
          <RefreshIcon refresh={refresh} /> <Text>No data found</Text>
        </Stack>
      ) : (
        <>
          {children(data.data, refresh, data?.meta)}
          {!data.meta.total ||
          (data.meta.last_page <= 1 && data.meta.current_page <= 1) ? null : (
            <Inline justify="center" align="center" gap={20}>
              <Button
                disabled={data?.meta.current_page === 1}
                variant="default"
                onClick={() => {
                  onParamsChange({
                    ...params,
                    page: data?.meta.current_page - 1,
                  });
                }}
              >
                <IconArrowLeft /> Prev
              </Button>
              <Button
                disabled={data?.meta.current_page === data?.meta.last_page}
                variant="default"
                onClick={() => {
                  onParamsChange({
                    ...params,
                    page: data?.meta.current_page + 1,
                  });
                }}
              >
                Next <IconArrowRight />
              </Button>
            </Inline>
          )}
        </>
      )}
    </Stack>
  );
}
