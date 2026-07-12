import React, { cloneElement } from "react";
import { Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface SideBarProps {
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
}: SideBarProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Drawer position={position} opened={opened} onClose={close} title={title}>
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
