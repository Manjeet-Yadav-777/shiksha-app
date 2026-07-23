import { Box, Button, Stack } from '@mantine/core';
import { Heading, Inline } from '../basic/Layout';
import { IconAdjustmentsHorizontal, IconSearch } from '@tabler/icons-react';
import type React from 'react';
import { Form, FormSpy, useForm, useFormState } from 'react-final-form';
import { useEffect, useRef } from 'react';
import { SideBar } from '../basic/SideBar';
import { TextInputField } from '../form/Input';
import { useTimeout } from '../../utils/react-hooks';

export type TSearchParams = {
  q?: string;
  page?: number;
  cursor?: string | null;
  limit?: number;
  sort?: string;
};

const defaultInitialParams: TSearchParams = {
  q: '',
};

interface SerachProps<T extends TSearchParams = TSearchParams> {
  title: string;
  actions?: React.ReactNode;
  initialParams?: T;
  filters?: () => React.ReactNode;
  onSearch: (params: T) => void;
  children?: React.ReactNode | ((props: ChildrenProps<T>) => React.ReactNode);
  placeHolder?: string;
}

interface ChildrenProps<T extends TSearchParams> {
  searchParams: T;
  setSearchParams: (params: Partial<T>) => void;
  setSearchParamValue: <K extends keyof T>(param: K, value: T[K]) => void;
}

export function Search<T extends TSearchParams = TSearchParams>({
  title,
  actions,
  initialParams = defaultInitialParams as T,
  filters,
  onSearch,
  children,
  placeHolder = 'Search...',
}: SerachProps<T>) {
  return (
    <Form initialValues={initialParams} onSubmit={onSearch}>
      {({ handleSubmit, values }) => {
        console.log({ values }, 'form');
        return (
          <form onSubmit={handleSubmit}>
            <Inline
              px={'lg'}
              align={'center'}
              py={'sm'}
              justify={'space-between'}
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Heading as="h3">{title}</Heading>

              <Inline gap={'md'}>
                <TextInputField
                  name="q"
                  placeholder={placeHolder}
                  leftSection={<IconSearch size={16} />}
                  rightSectionPointerEvents="all"
                  debounce={500}
                  styles={{
                    input: {
                      backgroundColor: '#fff',
                    },
                  }}
                  w={400}
                  rightSection={
                    filters ? (
                      <SideBar
                        size={'xs'}
                        title={<Heading>Filters</Heading>}
                        action={
                          <IconAdjustmentsHorizontal
                            cursor={'pointer'}
                            size={18}
                            stroke={1.8}
                          />
                        }
                      >
                        <Stack gap={'lg'}>
                          {filters()}
                          <Inline gap={'md'}>
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
            <Box display="flex" px={'lg'} py={'xl'}>
              <Box flex="1" miw={'0'}>
                {typeof children === 'function' ? (
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
                                  params[key as never as keyof T],
                                ),
                              );
                            });
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
            <SearchOnChange<T> />
          </form>
        );
      }}
    </Form>
  );
}

function SearchOnChange<T extends TSearchParams>() {
  const { values } = useFormState<T>({
    subscription: { values: true },
  });

  const form = useForm<T>();
  const previousValuesRef = useRef(values);
  // Mount pe submit skip karo — warna fresh mount pe ek extra fetch trigger
  // hota hai jo SWR key badal deta hai aur "Loading..." dobara flash karta hai.
  const isMountRef = useRef(true);

  const { set, clear } = useTimeout();

  useEffect(() => {
    const previous = previousValuesRef.current;

    const qChanged = previous.q !== values.q;

    previousValuesRef.current = values;

    if (isMountRef.current) {
      isMountRef.current = false;
      return;
    }

    clear();

    set(() => {
      // Search text change hui to page reset
      if (qChanged && values.page !== 1) {
        form.change('page' as keyof T, 1 as T[keyof T]);
      }

      form.submit();
    }, 500);

    return clear;
  }, [values, form, set, clear]);

  return null;
}
