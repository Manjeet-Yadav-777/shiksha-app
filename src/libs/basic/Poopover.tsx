import { useDisclosure } from "@mantine/hooks";
import { Popover as MPopver, Text, Button } from "@mantine/core";

interface PopoverProps {
  children: React.ReactNode;
  action: React.ReactNode;
  onHover?: boolean;
}

export function Popover({ children, action, onHover = false }: PopoverProps) {
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <MPopver
      width={200}
      position="bottom"
      withArrow
      shadow="lg"
      {...(onHover && { opened })}
    >
      <MPopver.Target
        {...(onHover && {
          onMouseEnter: open,
          onMouseLeave: close,
        })}
      >
        <Button>{action}</Button>
      </MPopver.Target>

      <MPopver.Dropdown>{children}</MPopver.Dropdown>
    </MPopver>
  );
}


