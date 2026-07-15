export interface ITenant{
    name : string
    _id : string
    slug : string
    address : string
    contactPhone : string
    contactEmail : string
    status : "active" | "suspended"
    createdAt : string
    updatedAt : string
}