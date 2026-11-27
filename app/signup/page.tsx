"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { PageTransition } from "@/components/shared/page-transition";
import { createClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage(
          "Account created. Check your email to confirm your address before signing in."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-radial-spotlight px-6 py-12">
      <PageTransition>
        <Card variant="glass" className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-brand-gradient shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-h2">Create your account</CardTitle>
            <CardDescription>
              Start building your adaptive knowledge graph
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="text-caption text-muted-foreground"
                >
                  Full name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ada Lovelace"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-caption text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-caption text-muted-foreground"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              {error ? (
                <div className="rounded-md border border-status-danger/30 bg-status-danger/10 p-3 text-caption text-status-danger">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="rounded-md border border-status-success/30 bg-status-success/10 p-3 text-caption text-emerald-300">
                  {message}
                </div>
              ) : null}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="justify-center border-t border-border pt-6">
            <p className="text-caption text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </PageTransition>
    </main>
  );
}
