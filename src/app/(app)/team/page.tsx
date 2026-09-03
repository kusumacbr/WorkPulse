"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeamRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-work");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-xs">
      <span>Redirecting to My Tasks & Team Deliverables...</span>
    </div>
  );
}
