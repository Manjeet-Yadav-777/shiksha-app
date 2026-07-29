import { type AnyObjectSchema, ValidationError } from 'yup';

type FormErrors = Record<string, unknown>;

export const ValidateSchema =
  <T extends object>(schema: AnyObjectSchema) =>
  async (values: T): Promise<FormErrors> => {
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

const setIn = (
  obj: Record<string, unknown>,
  path: string,
  value: string,
): void => {
  const keys = path.split('.');
  let current: Record<string, unknown> = obj;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      if (
        typeof current[key] !== 'object' ||
        current[key] === null ||
        Array.isArray(current[key])
      ) {
        current[key] = {};
      }

      current = current[key] as Record<string, unknown>;
    }
  });
};
