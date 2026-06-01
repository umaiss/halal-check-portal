"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, Mail, Loader2, KeyRound } from "lucide-react";
import Image from "next/image";
import { API_ENDPOINTS, AUTH_TOKEN_KEY } from "@/lib/constants";
import { decodeJwtRole, setUserRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid credentials");
      }

      const token = data?.access_token ?? data?.token ?? data?.accessToken;

      console.log("=== API LOGIN RESPONSE ===", data);

      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);

        // Extract role from token OR directly from the API response body
        const decodedFromJwt = decodeJwtRole(token);
        const rawResponseRole = data?.role ?? data?.user?.role ?? data?.user_type;
        const normalizedResponseRole = typeof rawResponseRole === 'string' ? rawResponseRole.toLowerCase() : null;

        let finalRole: "admin" | "assignee" | null = null;

        if (decodedFromJwt) {
          finalRole = decodedFromJwt;
        } else if (normalizedResponseRole === 'admin' || normalizedResponseRole === 'assignee') {
          finalRole = normalizedResponseRole as "admin" | "assignee";
        }

        console.log("Final Extracted Role:", finalRole);

        if (finalRole) {
          setUserRole(finalRole);
        } else {
          // If we absolutely cannot find the role, default to Admin for safety,
          // but log a severe warning.
          console.warn("Could not find role in JWT or Login Response! Defaulting to 'admin'.");
          setUserRole("admin");
        }
      }

      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });

      // Redirect based on role
      const cachedRole = localStorage.getItem('user_role');
      if (cachedRole === "assignee") {
        router.push("/products");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error("Login failed", {
        description: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[25%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-3 z-10">
        <Image src="/logo.png" alt="Scan Bazar Logo" width={36} height={36} className="rounded-xl object-contain shadow-md" />
        <span className="font-extrabold text-2xl tracking-tighter text-foreground">Scan Bazar</span>
      </div>

      <Card className="w-full max-w-[420px] shadow-2xl border-border/50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-10">
        <CardHeader className="space-y-3 pb-8 pt-10 px-8">
          <CardTitle className="text-3xl font-black tracking-tight text-center">Sign In</CardTitle>
          <CardDescription className="text-center text-base font-medium">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6 px-8">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="font-bold text-sm tracking-wide">EMAIL</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="admin@halalchecker.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                  className="pl-11 h-12 bg-white dark:bg-zinc-950 border-input"
                  defaultValue=""
                />
              </div>
            </div>
            <div className="space-y-2.5">
              {/* <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-sm tracking-wide">PASSWORD</Label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
              </div> */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  placeholder="********"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-11 h-12 bg-white dark:bg-zinc-950 border-input"
                  defaultValue=""
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-10 pt-4 px-8">
            <Button
              className="w-full text-base font-black tracking-wide h-12 shadow-lg hover:shadow-xl transition-all"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="absolute bottom-8 text-center text-xs font-semibold text-muted-foreground tracking-widest uppercase z-10">
        &copy; {new Date().getFullYear()} Scan Bazar. All rights reserved.
      </div>
    </div>
  );
}
