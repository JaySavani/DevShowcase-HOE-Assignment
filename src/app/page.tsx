import { auth } from "@/auth";
import ExplorePage from "@/components/explore";

export default async function Home() {
  const session = await auth();
  console.log(session);
  return <ExplorePage />;
}
