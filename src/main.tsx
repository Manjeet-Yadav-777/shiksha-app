import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import { SWRConfig } from 'swr';
import App from './App';
import './index.css';
import { Notifications } from '@mantine/notifications';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <MantineProvider>
    <Notifications />
    <SWRConfig
      value={{
        // Har tab-focus pe dobara fetch mat karo — isse /auth/me baar-baar fire hoke
        // cold-start pe error deta tha aur logout trigger karta tha.
        revalidateOnFocus: false,
        // Transient failure (cold start, timeout) pe thodi der baad khud retry karega
        // bajaye turant error dikhane ke.
        errorRetryCount: 3,
        errorRetryInterval: 3000,
        // Same key ke liye 5s ke andar duplicate requests dedupe kar do.
        dedupingInterval: 5000,
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SWRConfig>
  </MantineProvider>,
);
