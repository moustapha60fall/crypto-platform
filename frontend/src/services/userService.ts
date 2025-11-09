import axiosClient from "@/api/axiosClient";
import type { AppUser } from "@/types/app-user";
import type { RoleResponse } from "@/types/role-response";

export const userService = {

  // 🔐 Utilisateur connecté
  getProfile: (): Promise<AppUser> => axiosClient.get("/users/me").then(res => res.data),

  updateUser: (id: string, user: AppUser): Promise<AppUser> =>
    axiosClient.put(`/users/${id}`, user).then(res => res.data),

  getStatus: (): Promise<{ active: boolean; blocked: boolean }> =>
    axiosClient.get("/users/status").then(res => res.data),

  logout: (): Promise<void> =>
  axiosClient.post("/users/logout").then(() => {}),

  // 🛠️ Admin

  // 🔍 Récupérer les rôles d’un utilisateur par email
  getRolesByEmail: (email: string): Promise<RoleResponse[]> =>
    axiosClient.get(`/users/${email}/roles`).then(res => res.data),

  // 📄 Récupérer les utilisateurs paginés (structure complète)
  getAllUsersPaged: (page = 0, size = 10): Promise<{
    content: AppUser[],
    totalPages: number,
    totalElements: number,
    number: number,
    size: number
  }> =>
    axiosClient.get("/users/all", { params: { page, size } }).then(res => res.data),

  getUserById: (id: string): Promise<AppUser> =>
    axiosClient.get(`/users/${id}`).then(res => res.data),

  createUser: (user: AppUser): Promise<AppUser> =>
    axiosClient.post("/users", user).then(res => res.data),

  blockUser: (id: string, blocked: boolean): Promise<AppUser> =>
    axiosClient.patch(`/users/${id}/block`, null, { params: { blocked } }).then(res => res.data),

  updateRoles: (id: string, roles: string[]): Promise<AppUser> =>
    axiosClient.patch(`/users/${id}/roles`, roles).then(res => res.data),

  deleteUser: (id: string): Promise<void> =>
    axiosClient.delete(`/users/${id}`).then(() => { }),

  searchUsers: (keyword: string): Promise<AppUser[]> =>
    axiosClient.get("/users/search", { params: { keyword } }).then(res => res.data),
};
