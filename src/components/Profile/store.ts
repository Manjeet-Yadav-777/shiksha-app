import type { IUser } from "../Auth/store";

export function getRole(role? : IUser["role"]){
    switch(role){
        case "super_admin" :
            return "SUPER ADMIN"
        case "school_admin" :
            return "SCHOOL ADMIN"
        case "parent" :
            return "PARENT"
        case "student" :
            return "STUDENT"
        case "teacher" :
            return "STUDENT"
        default :
            return "Invalid Role"
    }
}