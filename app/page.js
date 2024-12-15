"use client";
import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import { renderSchemaTags } from "@/libs/seo";

import Footer from "@/components/Footer";

export default function Home() {
  const { data: status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "loading") {
        // Wait until the session status is determined
        return;
      }

      if (status === "authenticated") {
        const response = await fetch("/api/user");
        const user = await response.json();

        if (user.hasAccess) {
          router.push("/dashboard");
        } else {
          alert("no");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {renderSchemaTags()}
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <Problem />
        <FeaturesAccordion />
        <Pricing />
        <FAQ />
        {/* <CTA /> */}
      </main>
      <Footer />
    </>
  );
}
