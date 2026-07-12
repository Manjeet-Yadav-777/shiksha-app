import { ActionIcon, Button, Input } from "@mantine/core";
import { Heading, Inline } from "../basic/Layout";
import { borderColor } from "../vars";
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import type React from "react";
import { Form } from "react-final-form";
import { useRef } from "react";
import { SideBar } from "../basic/SideBar";

export type TSearchParams = {
  q?: string;
  page?: number;
  cursor?: string | null;
  limit?: number;
  sort?: string;
};

const defaultInitialParams: TSearchParams = {
  q: "",
};

interface SerachProps<T extends TSearchParams = TSearchParams> {
  title: string;
  actions?: React.ReactNode;
  initialParams?: T;
  filters?: React.ReactNode;
}

export function Search<T extends TSearchParams = TSearchParams>({
  title,
  actions,
  initialParams = defaultInitialParams as T,
  filters,
}: SerachProps) {
  const initialParamsRef = useRef(initialParams);
  return (
    <Form initialValues={initialParamsRef} onSubmit={() => {}}>
      {({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Inline
            px={"lg"}
            align={"center"}
            py={"sm"}
            justify={"space-between"}
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Heading as="h3">{title}</Heading>

            <Inline gap={"md"}>
              <Input
                leftSection={<IconSearch size={16} />}
                rightSectionPointerEvents="all"
                styles={{
                  input: {
                    backgroundColor: "#fff",
                  },
                }}
                w={400}
                rightSection={
                  <SideBar
                    title={<Heading>Filters</Heading>}
                    action={
                      <IconAdjustmentsHorizontal
                        cursor={"pointer"}
                        size={18}
                        stroke={1.8}
                      />
                    }
                  >
                    <div>Filters Content</div>
                  </SideBar>
                }
                placeholder="Search..."
              />
              {actions}
            </Inline>
          </Inline>
        </form>
      )}
    </Form>
  );
}
