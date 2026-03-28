"use server"

import { cookies } from 'next/headers'
import { cache } from 'react'
import type { User } from "@gym-app/types"

export const getCurrentUser = cache(async (): Promise<User | null> => {
   const token = (await cookies()).get('token')?.value
   if (!token) return null

   const res = await fetch(`${process.env.NEST_API_URL}/auth/me`, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
   })

   if (!res.ok) return null

   return res.json()
})
