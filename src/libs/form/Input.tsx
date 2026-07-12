import {
  Input,
  TextInput,
  type InputProps,
  type TextInputProps,
} from "@mantine/core";
import { Field } from "react-final-form";

interface InputBoxProps extends InputProps {
  bg?: string;
  pH?: string;
}

interface TextInputBoxProps extends TextInputProps {
  name: string;
}

export function InputBox({ bg = "#fff", pH, ...props }: InputBoxProps) {
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

export function TextInputBox({ ...props }: TextInputBoxProps) {
  return (
    <Field name={props.name}>
      {({ input }) => <TextInput {...props} {...input} />}
    </Field>
  );
}
