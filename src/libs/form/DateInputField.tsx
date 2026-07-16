import { Field } from "react-final-form";
import { DateInput, type DateInputProps } from "@mantine/dates";

type SelectInputFieldProps = DateInputProps & {
  name: string;
};

export function DatenputField({
  name,
  label,
  placeholder,
  clearable = false,
  ...props
}: SelectInputFieldProps) {
  return (
    <Field name={name}>
      {({ input }) => (
        <DateInput
          {...props}
          label={label}
          placeholder={placeholder}
          value={input.value}
          onChange={input.onChange}
          clearable={clearable}
        />
      )}
    </Field>
  );
}
