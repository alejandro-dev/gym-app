"use server"

import { cache } from 'react'
import type { User } from "@gym-app/types"
import { backendFetch } from "@/services/backend"
import { ErrorCode } from "@/services/errors/ErrorCode"

export const getCurrentUser = cache(async (): Promise<User | null> => {
   try {
      return await backendFetch<User>("/auth/me");
   } catch (error) {
      if (error instanceof ErrorCode && error.status === 401) {
         return null;
      }

      throw error;
   }
})
