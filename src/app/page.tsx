import type { Metadata } from "next";

import ExplorePage from "@/components/explore";

export const metadata: Metadata = {
  title: "Explore Community Projects",
  description:
    "Browse the latest and greatest projects built by the developer community. Vote, comment, and get inspired.",
};

export default async function Home() {
  return <ExplorePage />;
}
