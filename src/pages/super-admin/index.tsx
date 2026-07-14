import { useAuthUser } from "../../hooks/auth"

export default function SuperAdmin(){
    const user = useAuthUser()
    return <div>Super Admin</div>
}