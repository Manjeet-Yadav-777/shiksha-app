import type { ReactNode } from "react";
import { Menu } from "@mantine/core";


export interface MenuOption {
  label: ReactNode;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  color?: string;
  disabled?: boolean;

  onClick?: () => void;

  children?: MenuOption[];
}


export interface DropdownMenuProps {
  children: ReactNode;
  items: MenuOption[];

  width?: number;
  position?:
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "top"
    | "top-start"
    | "top-end"
    | "left"
    | "right";

  trigger?: "click" | "hover";
}

function renderItems(items: MenuOption[]) {
  return items.map((item, index) => {
    if (item.children?.length) {
      return (
        <Menu.Sub key={index}>
          <Menu.Sub.Target>
            <Menu.Sub.Item
              leftSection={item.leftSection}
              rightSection={item.rightSection}
              disabled={item.disabled}
            >
              {item.label}
            </Menu.Sub.Item>
          </Menu.Sub.Target>

          <Menu.Sub.Dropdown>{renderItems(item.children)}</Menu.Sub.Dropdown>
        </Menu.Sub>
      );
    }

    return (
      <Menu.Item
        key={index}
        color={item.color}
        leftSection={item.leftSection}
        rightSection={item.rightSection}
        disabled={item.disabled}
        onClick={item.onClick}
      >
        {item.label}
      </Menu.Item>
    );
  });
}

export function DropdownMenu({
  children,
  items,
  width = 220,
  position = "bottom-start",
  trigger = "click",
}: DropdownMenuProps) {
  return (
    <Menu
      width={width}
      position={position}
      trigger={trigger}
      shadow="md"
      withArrow
    >
      <Menu.Target>{children}</Menu.Target>

      <Menu.Dropdown>{renderItems(items)}</Menu.Dropdown>
    </Menu>
  );
}
