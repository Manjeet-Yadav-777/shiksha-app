import { ValidationError } from 'yup';
import type { AnyObjectSchema } from 'yup';

type FormErrors = {
  [key: string]: any;
};

export const ValidateSchema =
  (schema: AnyObjectSchema) =>
  async (values: any): Promise<FormErrors> => {
    try {
      await schema.validate(values, {
        abortEarly: false,
      });
      return {};
    } catch (err) {
      const errors: FormErrors = {};

      if (err instanceof ValidationError) {
        err.inner.forEach((error) => {
          if (!error.path) return;

          setIn(errors, error.path, error.message);
        });
      }

      return errors;
    }
  };

// 👇 nested object support (like user.email etc)
const setIn = (obj: any, path: string, value: any) => {
  const keys = path.split('.');
  let current = obj;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = current[key] || {};
      current = current[key];
    }
  });
};
