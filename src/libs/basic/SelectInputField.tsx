import { Select, type SelectProps } from "@mantine/core";
import { Field } from "react-final-form";

type SelectInputFieldProps = SelectProps & {
  name: string;
};

export function SelectInputField({
  name,
  label,
  data,
  placeholder,
  clearable = false
}: SelectInputFieldProps) {
  return (
    <Field name={name}>
      {({ input }) => (
        <Select
          label={label}
          placeholder={placeholder}
          data={data}
          value={input.value}
          onChange={input.onChange}
          clearable={clearable}
        />
      )}
    </Field>
  );
}
