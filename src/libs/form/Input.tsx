import {
  Input,
  PasswordInput,
  TextInput,
  type InputProps,
  type TextInputProps,
  type PasswordInputProps,
} from "@mantine/core";
import { Field } from "react-final-form";

interface InputFieldProps extends InputProps {
  bg?: string;
  pH?: string;
}

type TextInputFieldProps =
  | ({ type?: "text" } & TextInputProps)
  | ({ type: "password" } & PasswordInputProps);

interface BaseProps {
  name: string;
}

type Props = BaseProps & TextInputFieldProps;

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

export function TextInputField({ ...props }: Props) {
  return (
    <Field name={props.name}>
      {({ input, meta }) =>
        props.type === "password" ? (
          <PasswordInput
            {...props}
            {...input}
            error={meta.touched && meta.error ? meta.error : ""}
            placeholder={meta.error && meta.touched ? "" : props.placeholder}
          />
        ) : (
          <TextInput
            {...props}
            {...input}
            error={meta.touched && meta.error ? meta.error : ""}
            placeholder={meta.error && meta.touched ? "" : props.placeholder}
          />
        )
      }
    </Field>
  );
}
