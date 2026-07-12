import { Box, Button, Flex, Text } from "@mantine/core";
import { NavLink } from "../utils/Link";

export function Navbar() {
  return (
    <Flex
      justify={"space-between"}
      align={"center"}
      px={"lg"}
      h={"60"}
      bg={"dark"}
    >
      <Flex gap={"xl"}>
        <Box>
          <Text fw={"bold"} c={"#fff"}>
            MJ
          </Text>
        </Box>
        <Flex gap={"lg"} c={"#fff"}>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/tenants">Tenants</NavLink>
        </Flex>
      </Flex>

      <Flex>
        <Button type="reset">Logout</Button>
      </Flex>
    </Flex>
  );
}
