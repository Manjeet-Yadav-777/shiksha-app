import {
  Input,
  TextInput,
  type InputProps,
  type TextInputProps,
} from "@mantine/core";
import { Field } from "react-final-form";

interface InputFieldProps extends InputProps {
  bg?: string;
  pH?: string;
}

interface TextInputFieldProps extends TextInputProps {
  name: string;
}

export function InputField({ bg = "#fff", pH, ...props }: InputFieldProps) {
  return (
    <Input
      placeholder={pH}
      styles={{
        input: {
          backgroundColor: bg,
          border: "1px solid black",
        },
      }}
      {...props}
    />
  );
}

export function TextInputField({ ...props }: TextInputFieldProps) {
  return (
    <Field name={props.name}>
      {({ input }) => <TextInput {...props} {...input} />}
    </Field>
  );
}
