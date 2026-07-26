import { Button, Container, Stack, Text } from '@mantine/core';
import { Inline } from '../../libs/basic/Layout';
import { TextInputField } from '../../libs/form/Input';
import { Form } from 'react-final-form';
import { ValidateSchema } from '../../helpers/ValidationSchema';
import * as yup from 'yup';
import { mutate } from 'swr';
import { xhr } from '../../libs/XHR/xhr';
import { useNavigate } from 'react-router-dom';
import { redirectFromLogin } from '../../utils/redirectFromLogin';

const LoginSchema = ValidateSchema(
  yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  }),
);

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <Inline align="center" justify="center" h={'100vh'}>
      <Stack>
        <Container w={'500px'}>
          <Form
            validate={LoginSchema}
            onSubmit={async (values) => {
              const res = await xhr.post('/auth/login', values);
              // Seed the /auth/me SWR cache with the logged-in user so
              // ProtectedRoutes reads the fresh user immediately instead of the
              // stale "unauthenticated" entry from before login. Without this the
              // guard bounces back to /login and only works on a second attempt.
              await mutate('/auth/me', res.data, { revalidate: false });
              redirectFromLogin(res, navigate);
            }}
          >
            {({ handleSubmit, submitting }) => (
              <form onSubmit={handleSubmit}>
                <Stack
                  gap={'lg'}
                  p={'xl'}
                  style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
                  bdrs={'lg'}
                >
                  <Text fz={'h3'} fw={'-moz-initial'} ta={'center'}>
                    Login to Shiksha
                  </Text>
                  <TextInputField
                    name="email"
                    label="Email"
                    placeholder="jhon@gmail.com"
                  />
                  <TextInputField
                    name="password"
                    label="Password"
                    placeholder="********"
                    type="password"
                  />
                  <Button
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                  >
                    {submitting ? 'Logging in...' : 'Login'}
                  </Button>
                  <Text>
                    forgot password{' '}
                    <span
                      style={{
                        cursor: 'pointer',
                        color: 'blue',
                        textDecoration: 'underline',
                      }}
                    >
                      click here
                    </span>{' '}
                    to reset.
                  </Text>
                </Stack>
              </form>
            )}
          </Form>
        </Container>
      </Stack>
    </Inline>
  );
}
