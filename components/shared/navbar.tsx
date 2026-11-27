"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  userEmail?: string | null;
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-gradient shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-h3 tracking-tight text-foreground">
            Learnova <span className="gradient-text">AI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {userEmail ? (
            <>
              <Link
                href="/dashboard"
                className="text-body text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
