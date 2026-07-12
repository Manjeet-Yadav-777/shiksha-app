import React, { cloneElement } from "react";
import { Drawer, type DrawerProps } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface SideBarProps extends Partial<DrawerProps> {
  action: React.ReactElement<{
    onClick?: React.MouseEventHandler;
  }>;
  title: string | React.ReactNode;
  children: React.ReactNode;
  position?: "right" | "left" | "top" | "bottom";
}

export function SideBar({
  action,
  title,
  children,
  position = "right",
  ...props
}: SideBarProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer
        {...props}
        position={position}
        opened={opened}
        onClose={close}
        title={title}
      >
        <hr
          style={{
            backgroundColor: "#E5E7EB",
            height: "1px",
            marginBottom: "10px",
          }}
        />
        {children}
      </Drawer>

      {cloneElement(action, {
        onClick: open,
      })}
    </>
  );
}
