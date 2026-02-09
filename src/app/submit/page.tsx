import type { Metadata } from "next";

import SubmitProjectPage from "@/components/submit";

export const metadata: Metadata = {
  title: "Submit Your Project",
  description:
    "Share your amazing project with the developer community. Get feedback, upvotes, and recognition.",
};

export default function SubmitPage() {
  return <SubmitProjectPage />;
}
