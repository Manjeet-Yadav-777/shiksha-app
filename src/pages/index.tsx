import { Button } from "@mantine/core";
import { Search } from "../libs/search/Search";

export default function Dashboard() {
  return (
    <div>
      <Search title="Student List" actions={<Button>Add Student</Button>} />
    </div>
  );
}
