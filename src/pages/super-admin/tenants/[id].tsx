import { useParams } from "react-router-dom";
import { SingleTenant } from "../../../components/tenants/TenantView";

export default function TenantView() {
  const { id } = useParams();
  return <SingleTenant id={id}/>;
}
