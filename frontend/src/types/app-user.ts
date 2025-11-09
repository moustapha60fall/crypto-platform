import type { RoleResponse } from "./role-response"

export interface AppUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email?: string
  phoneNumber?: string
  nomRegion?: string
  nomVille?: string
  address?: string
  civilite: string
  sessionStart?: string
  active: boolean
  blocked: boolean
  lastLogin?: string
  roles?: RoleResponse[];
}
