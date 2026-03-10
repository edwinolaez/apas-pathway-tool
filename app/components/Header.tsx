"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton, useAuth } from "@clerk/nextjs";
import ProtectedButton from "./ProtectedButton";

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="w-full py-4 px-6 md:px-12 lg:px-20 flex items-center justify-between bg-white border-b border-border/40 shadow-lg">
      <div className="flex items-center gap-1">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Pathr Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-4">
        <Link
          href="/test"
          className="inline-flex items-center rounded-full px-4 py-2 text-sm text-primary font-bold hover:text-foreground transition-colors"
        >
          Explore Programs
        </Link>
        <Link
          href="/eligibility"
          className="inline-flex items-center rounded-full px-4 py-2 text-sm text-primary font-bold hover:text-foreground transition-colors"
        >
          Eligibility
        </Link>
        
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold text-primary hover:bg-foreground hover:text-white transition-colors"
            >
              My Profile
            </Link>
            <UserButton />
          </div>
        ) : (
          <ProtectedButton
            href="/profile"
            mode="signin"
            className="inline-flex items-center rounded-full border-2 border-foreground px-4 py-2 text-sm font-bold text-primary hover:bg-foreground hover:text-white transition-colors"
          >
            Get Started
          </ProtectedButton>
        )}
      </nav>
    </header>
  );
}
