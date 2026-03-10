"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useSyncExternalStore } from "react";
import AuthModal from "./AuthModal";

interface ProtectedButtonProps {
  href: string;
  className: string;
  children: React.ReactNode;
  mode?: "signin" | "signup";
}

export default function ProtectedButton({
  href,
  className,
  children,
  mode = "signup",
}: ProtectedButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const isOAuthCallback = useSyncExternalStore(
    () => () => {},
    () => window.location.hash.includes("sso-callback"),
    () => false,
  );

  // Auto-redirect after OAuth callback completes
  useEffect(() => {
    if (!isOAuthCallback || !isLoaded || !isSignedIn) {
      return;
    }

    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const redirectUrl =
      params.get("sign_up_force_redirect_url") ||
      params.get("sign_in_force_redirect_url") ||
      href;

    const decodedUrl = decodeURIComponent(redirectUrl);

    // Remove callback hash before navigating.
    window.history.replaceState({}, "", window.location.pathname);
    router.replace(decodedUrl);
  }, [isOAuthCallback, isLoaded, isSignedIn, href, router]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSignedIn) {
      router.push(href);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button onClick={handleClick} className={className}>
        {children}
      </button>
      <AuthModal
        isOpen={showModal || (isOAuthCallback && !isSignedIn)}
        onClose={() => setShowModal(false)}
        mode={mode}
      />
    </>
  );
}
