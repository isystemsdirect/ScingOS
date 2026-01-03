
'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { Chrome, Mail, Apple } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const auth = getFirebaseAuth();
    if (!auth) {
        toast({ title: "Error", description: "Firebase is not configured.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Success", description: "Logged in successfully." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
   const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const auth = getFirebaseAuth();
    if (!auth) {
      toast({ title: "Error", description: "Firebase is not configured.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Success", description: "Logged in with Google." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
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
              <div className="grid grid-cols-3 gap-2">
                 <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <Chrome className="mr-2 h-4 w-4" />
                  Google
                </Button>
                 <Button variant="outline" type="button" disabled>
                  <Apple className="mr-2 h-4 w-4" />
                  Apple
                </Button>
                <Button variant="outline" type="button" disabled>
                  <Mail className="mr-2 h-4 w-4" />
                  Microsoft
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
