import type { IUser } from "../Auth/store"

export interface ITenant{
    name : string
    _id : string
    slug : string
    address : string
    contactPhone : string
    contactEmail : string
    status : "active" | "suspended"
    admin : IUser
    createdAt : string
    updatedAt : string
}