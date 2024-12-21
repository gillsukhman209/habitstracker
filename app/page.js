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
import WithWithout from "@/components/WithWithout";
import { renderSchemaTags } from "@/libs/seo";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";
export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (status === "loading") {
        return;
      }

      if (session && session.user) {
        const response = await (await fetch("/api/user")).json();

        const user = response.user;

        if (user.hasAccess) {
          setHasAccess(user.hasAccess);
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router, status]);

  useEffect(() => {
    if (!loading) {
      // Dismiss any existing toasts
      toast.dismiss();

      if (hasAccess) {
        toast.success("You have access", { id: "access-toast" });
      } else {
        toast.error("You do not have access", { id: "access-toast" });
      }
    }
  }, [hasAccess, loading]);

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
        <WithWithout />
        {/* <CTA /> */}
      </main>
      <Footer />
    </>
  );
}
