
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/40 p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center">
          <div className="relative mb-4 flex justify-center pt-8">
             <div className="absolute inset-x-0 top-0 h-[150px] w-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_70%)]"></div>
            <Logo isLoginPage={true} />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
