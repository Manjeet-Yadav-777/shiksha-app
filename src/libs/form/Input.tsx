import {
  Input,
  PasswordInput,
  TextInput,
  type InputProps,
  type TextInputProps,
  type PasswordInputProps,
  Textarea,
  type TextareaProps,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { Field } from "react-final-form";

interface InputFieldProps extends InputProps {
  bg?: string;
  pH?: string;
}

type TextInputFieldProps =
  | ({ type?: "text" | "number" } & TextInputProps)
  | ({ type: "password" } & PasswordInputProps)
  | ({ type: "textarea" } & TextareaProps);

interface BaseProps {
  name: string;
  debounce?: number;
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

// export function TextInputField({ ...props }: Props) {
//   return (
//     <Field name={props.name}>
//       {({ input, meta }) =>
//         props.type === "password" ? (
//           <PasswordInput
//             {...props}
//             {...input}
//             error={meta.touched && meta.error ? meta.error : ""}
//             placeholder={meta.error && meta.touched ? "" : props.placeholder}
//           />
//         ) : (
//           <TextInput
//             {...props}
//             {...input}
//             error={meta.touched && meta.error ? meta.error : ""}
//             placeholder={meta.error && meta.touched ? "" : props.placeholder}
//           />
//         )
//       }
//     </Field>
//   );
// }

export function TextInputField({ debounce, ...props }: Props) {
  return (
    <Field name={props.name}>
      {({ input, meta }) => {
        const [localValue, setLocalValue] = useState(input.value ?? "");

        useEffect(() => {
          setLocalValue(input.value ?? "");
        }, [input.value]);

        useEffect(() => {
          if (!debounce) return;

          const timer = setTimeout(() => {
            if (localValue !== input.value) {
              input.onChange(localValue);
            }
          }, debounce);

          return () => clearTimeout(timer);
        }, [localValue, debounce, input]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          if (debounce) {
            setLocalValue(e.currentTarget.value);
          } else {
            input.onChange(e);
          }
        };

        if (props.type === "password") {
          return (
            <PasswordInput
              {...props}
              value={debounce ? localValue : input.value}
              onChange={handleChange}
              error={meta.touched ? meta.error : undefined}
              placeholder={meta.touched && meta.error ? "" : props.placeholder}
            />
          );
        }

        if (props.type === "textarea") {
          return (
            <Textarea
              {...props}
              value={debounce ? localValue : input.value}
              onChange={handleChange}
              error={meta.touched ? meta.error : undefined}
              placeholder={meta.touched && meta.error ? "" : props.placeholder}
            />
          );
        }

        return (
          <TextInput
            {...props}
            type={props.type}
            value={debounce ? localValue : input.value}
            onChange={handleChange}
            error={meta.touched ? meta.error : undefined}
            placeholder={meta.touched && meta.error ? "" : props.placeholder}
          />
        );
      }}
    </Field>
  );
}
