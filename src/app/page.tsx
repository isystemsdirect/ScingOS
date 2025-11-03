
'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { Chrome, Mail, MessageSquare, Apple } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e?: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (typeof window !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/40 p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl font-bold">Welcome to</CardTitle>
          <Logo isLoginPage={true} />
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Button variant="outline" onClick={handleLogin}>
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
                 <Button variant="outline" onClick={handleLogin}>
                  <Apple className="mr-2 h-4 w-4" />
                  Apple
                </Button>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleLogin}>
                  <Mail className="mr-2 h-4 w-4" />
                  Microsoft
                </Button>
                <Button variant="outline" onClick={handleLogin}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
