import { Checkbox } from '@mantine/core';
import { Inline } from '../basic/Layout';

type Option = {
  name: string;
  label: string;
};

type Props<T extends Record<string, boolean>> = {
  options: Option[];
  states: T;
  setStates: React.Dispatch<React.SetStateAction<T>>;
};

export function OptionHeader<T extends Record<string, boolean>>({
  options,
  states,
  setStates,
}: Props<T>) {
  const handleCheckboxChange = (key: keyof T, checked: boolean) => {
    setStates((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <Inline
      pos="sticky"
      wrap={'wrap'}
      top={0}
      py="md"
      px="md"
      style={{
        zIndex: 100,
        boxShadow: '0 6px 8px -6px rgba(0, 0, 0, 0.18)',
      }}
    >
      {options.map((option) => (
        <Checkbox
          key={option.name}
          styles={{
            root: { cursor: 'pointer' },
            input: { cursor: 'pointer', border: '1px solid black' },
            label: { cursor: 'pointer', fontWeight: 'bold' },
          }}
          label={option.label}
          checked={states[option.name as keyof T]}
          onChange={(e) =>
            handleCheckboxChange(
              option.name as keyof T,
              e.currentTarget.checked,
            )
          }
        />
      ))}
    </Inline>
  );
}
