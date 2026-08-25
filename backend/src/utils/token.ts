import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "jgn3rjngrjendkjjtr54u35iu43ioi1ri3or1ejditjdc.sw;sp[3flpr3mfknrj");

export async function getUserFromToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");

  console.error('header', authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return null;

  console.log('test');
  const token = authHeader.split(" ")[1];
  console.log('test2', token);
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "music room",
    });
    console.log('test3', payload);
    return  payload.user_id as string;
  } catch (err) {
    console.log("JWT VERIFY ERROR:", err);
    return null;
  }
}