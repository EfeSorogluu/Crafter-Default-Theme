"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/lib/context/auth.context";
import GiftClient from "@/components/gift";
import Loading from "@/components/loading";

export default function GiftPage() {
  const router = useRouter();
  const { user, isLoading: userIsLoading, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (userIsLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/auth/sign-in?return=/gift");
      return;
    }
  }, [user, userIsLoading, isAuthenticated, router]);

  if (userIsLoading) {
    return <Loading show={true} message="Yükleniyor..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <GiftClient />;
}
