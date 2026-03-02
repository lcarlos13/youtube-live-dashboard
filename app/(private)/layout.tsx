import BottomNav from "@/components/BottomNav";
import "react-datepicker/dist/react-datepicker.css";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type UserToken = {
  name: string;
  role: "admin" | "user";
};

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth")?.value;

  let role: "admin" | "user" | null = null;
  let name: string | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as UserToken;

      role = decoded.role;
      name = decoded.name;
    } catch {}
  }

  return (
    <>
      <div className="pb-20">{children}</div>

      <BottomNav role={role} name={name} />
    </>
  );
}