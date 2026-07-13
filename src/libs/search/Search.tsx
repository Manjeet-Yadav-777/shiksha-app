import { Box, Button, Stack } from "@mantine/core";
import { Heading, Inline } from "../basic/Layout";
import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import type React from "react";
import { Form, FormSpy, useForm, useFormState } from "react-final-form";
import { useEffect, useRef } from "react";
import { SideBar } from "../basic/SideBar";
import { TextInputField } from "../form/Input";
import { useTimeout } from "../../utils/react-hooks";

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
  filters?: () => React.ReactNode;
  onSearch: (params: T) => void;
  children?: React.ReactNode | ((props: ChildrenProps<T>) => React.ReactNode)
}

interface ChildrenProps<T extends TSearchParams>{
  searchParams : T
  setSearchParams : (params : Partial<T>) => void
	setSearchParamValue: <K extends keyof T>(param: K, value: T[K]) => void
}

export function Search<T extends TSearchParams = TSearchParams>({
  title,
  actions,
  initialParams = defaultInitialParams as T,
  filters,
  onSearch,
  children
}: SerachProps<T>) {
  const initialParamsRef = useRef(initialParams);
  return (
    <Form initialValues={initialParamsRef.current} onSubmit={onSearch}>
      {({ handleSubmit, values }) => {
        console.log({ values }, "form");
        return (
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
                <TextInputField
                  name="q"
                  placeholder="Search..."
                  leftSection={<IconSearch size={16} />}
                  rightSectionPointerEvents="all"
                  styles={{
                    input: {
                      backgroundColor: "#fff",
                    },
                  }}
                  w={400}
                  rightSection={
                    filters ? (
                      <SideBar
                        size={"xs"}
                        title={<Heading>Filters</Heading>}
                        action={
                          <IconAdjustmentsHorizontal
                            cursor={"pointer"}
                            size={18}
                            stroke={1.8}
                          />
                        }
                      >
                        <Stack gap={"lg"}>
                          {filters()}
                          <Inline gap={"md"}>
                            <Button type="submit">Apply Filters</Button>
                            <Button variant="default">Clear Filters</Button>
                          </Inline>
                        </Stack>
                      </SideBar>
                    ) : null
                  }
                />
                {actions}
              </Inline>
            </Inline>
            <Box display="flex" px={"lg"} py={"xl"}>
								<Box flex="1" miw={"0"}>
									{typeof children === "function" ? (
										<FormSpy<T> subscription={{ values: true }}>
											{(props) => (
												<>
													{children({
														searchParams: props.values,
														setSearchParams: (params) => {
															props.form.batch(() => {
																Object.keys(params).forEach((key) =>
																	props.form.change(
																		key as never as keyof T,
																		params[key as never as keyof T]
																	)
																)
															})
														},
														setSearchParamValue: props.form.change,
													})}
												</>
											)}
										</FormSpy>
									) : (
										children
									)}
								</Box>
            </Box>
            <SearchOnChange<T> onChange={onSearch} />
          </form>
        );
      }}
    </Form>
  );
}

function SearchOnChange<T extends object>({
  onChange,
}: {
  onChange: (params: T) => void;
}) {
  const { values } = useFormState<T>({
    subscription: { values: true },
  });
  console.log({ values });

  const previousValuesRef = useRef<T | null>(values);
  const form = useForm<T>();
  const { set: setSubmitterTimeout, clear: clearSubmitterTimeout } =
    useTimeout();

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // fetch prices
  useEffect(() => {
    const previousValues = { ...previousValuesRef.current };
    setSubmitterTimeout(() => {
      previousValuesRef.current = values;
      const previousKeys = Object.keys(previousValues || ({} as T));
      const newKeys = Object.keys(values || ({} as T));
      if (
        previousKeys.length !== newKeys.length ||
        previousKeys.some(
          (k) => !Object.is(previousValues[k as never], values[k as never]),
        )
      ) {
        form.submit();
      }
    }, 1000);
    return () => clearSubmitterTimeout();
  }, [values, form, setSubmitterTimeout, clearSubmitterTimeout]);
  return null;
}
