import { Box } from "@mantine/core";
import { Inline } from "../libs/basic/Layout";
import { NavLink } from "../utils/Link";
import { IconSettings } from "@tabler/icons-react";

export function Navbar() {
  return (
    <Inline
      bg={"#000"}
      h={"100%"}
      align={"center"}
      px={"xl"}
      justify={"space-between"}
    >
      <Inline gap={"xl"} align={"center"}>
        <Inline
          bg={"#fff"}
          align={"center"}
          justify={"center"}
          bdrs={"xl"}
          fw={"bolder"}
          c={"#000"}
          h={"30px"}
          w={"30px"}
        >
          <NavLink to="/super-admin" color={"#000"}>
            MJ
          </NavLink>
        </Inline>

        <Inline gap={"lg"} fw={"bolder"}>
          <NavLink to="/super-admin/tenants">Tenants</NavLink>
          <NavLink to="/super-admin/payments">Payments</NavLink>
        </Inline>
      </Inline>

      <Inline align={"center"}>
        <Box>
          <IconSettings cursor={"pointer"} size={20} color="white" />
        </Box>
      </Inline>
    </Inline>
  );
}
