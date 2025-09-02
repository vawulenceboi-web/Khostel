import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      firstName: string
      lastName?: string
      phone?: string
      address?: string
      profileImage?: string
      facePhoto?: string
      role: string
      verifiedStatus: boolean
      schoolId?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName?: string
    phone?: string
    address?: string
    profileImage?: string
    facePhoto?: string
    role: string
    verifiedStatus: boolean
    schoolId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    verifiedStatus: boolean
    firstName: string
    lastName?: string
    phone?: string
    address?: string
    profileImage?: string
    facePhoto?: string
    schoolId?: string
  }
}