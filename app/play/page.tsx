import { redirect } from "next/navigation";

// The quest now lives on the home page; keep old /play links working.
export default function PlayPage() {
  redirect("/");
}
