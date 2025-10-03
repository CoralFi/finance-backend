import { getToken } from "next-auth/jwt";

export const requireAuth = async (req) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log(token)
  if (!token) {
    return false
  }

  return token;  
};
