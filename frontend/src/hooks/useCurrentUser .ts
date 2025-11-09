// hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query"
import { userService } from "@/services/userService"
import type { AppUser } from "@/types/app-user"

export const useCurrentUser = () => {
  return useQuery<AppUser, Error>({
    queryKey: ["currentUser"],
    queryFn: userService.getProfile,
  })
}
