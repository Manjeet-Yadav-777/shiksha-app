import { useDisclosure } from '@mantine/hooks';
import { Modal, Text } from '@mantine/core';
import type { TSizes } from '../types';

interface DialogProps {
  children: React.ReactNode;
  isOpened: boolean;
  close: () => void;
  title?: string;
  center?: boolean;
  removeHeader?: boolean;
  sizes?: TSizes | '70%' | '100%' | '45rem' | '55rem' | 'auto';
  fullScreen?: boolean;
  bgBlur?: boolean;
}

export function Dialog({
  children,
  isOpened,
  close,
  title,
  center,
  removeHeader,
  fullScreen,
  bgBlur,
  sizes = 'lg',
}: DialogProps) {
  return (
    <>
      <Modal
        opened={isOpened}
        onClose={close}
        title={
          <Text fw={'bold'} fz={'h3'}>
            {title}
          </Text>
        }
        centered={center}
        withCloseButton={!removeHeader}
        size={sizes}
        fullScreen={fullScreen}
        overlayProps={{
          backgroundOpacity: bgBlur ? 0.55 : undefined,
          blur: bgBlur ? 3 : undefined,
        }}
      >
        <hr
          style={{
            backgroundColor: '#E5E7EB',
            height: '1px',
            border: 'none',
            marginBottom: '10px',
          }}
        />
        {children}
      </Modal>
    </>
  );
}

export function useDialog(initialState = false) {
  const [opened, handlers] = useDisclosure(initialState);

  return {
    isOpened: opened,
    ...handlers,
  };
}
