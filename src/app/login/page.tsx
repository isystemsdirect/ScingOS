
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { Chrome, Mail, MessageSquare } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
            <Button type="submit" className="w-full" asChild>
              <Link href="/dashboard">Login</Link>
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
               <Button variant="outline">
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.0003 4.75C13.7703 4.75 15.3553 5.431 16.6053 6.545L19.5633 3.587C17.5883 1.738 15.0253 0.75 12.0003 0.75C7.3003 0.75 3.3253 3.654 1.5563 7.594L4.9963 10.023C5.7953 7.643 8.6203 5.75 12.0003 5.75V4.75Z"></path><path fill="currentColor" d="M23.25 12C23.25 11.231 23.181 10.481 23.056 9.75H12V14.25H18.441C18.181 15.759 17.344 17.062 16.094 17.913L19.494 20.342C21.844 18.263 23.25 15.394 23.25 12Z"></path><path fill="currentColor" d="M12.0003 23.25C15.0253 23.25 17.5883 22.262 19.5633 20.342L16.0943 17.913C15.0763 18.6 13.6253 19.25 12.0003 19.25C8.6203 19.25 5.7953 17.357 4.9963 14.977L1.5563 17.406C3.3253 21.346 7.3003 24.25 12.0003 24.25V23.25Z"></path></svg>
                Google
              </Button>
               <Button variant="outline">
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4"><path fill="currentColor" d="M12.152 6.896c-.922 0-1.554.63-1.554 1.514c0 .905.65 1.513 1.572 1.513c.921 0 1.553-.608 1.553-1.513c0-.884-.632-1.514-1.57-1.514m2.02.018c.884 0 1.483.509 1.483 1.258c0 .767-.582 1.259-1.465 1.259c.865 0 1.448.509 1.448 1.276c0 .768-.582 1.277-1.483 1.277c-.904 0-1.482-.509-1.482-1.277c0-.767.578-1.276 1.482-1.276c-.865 0-1.447-.509-1.447-1.259c0-.749.58-1.258 1.465-1.258M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0m6.566 18.363c-.12.18-.24.355-.387.513c-.148.158-.309.305-.479.435c-.17.13-.358.24-.552.33c-.193.09-.404.135-.62.135c-.347 0-.67-.09-1.01-.278c-.34-.189-.621-.45-.841-.784c-.22-.334-.33-.714-.33-1.148c0-.492.14-1.02.42-1.582c.28-.562.674-1.12.992-1.498c.32-.378.562-.68.728-.906c.166-.225.25-.485.25-.783c0-.312-.08-.57-.24-.774c-.16-.204-.39-.306-.69-.306c-.262 0-.485.064-.67.19c-.185.128-.32.32-.404.578l-1.534-.93c.333-.56.784-1.01 1.352-1.348c.568-.337 1.23-.506 1.98-.506c.715 0 1.33.159 1.844.478c.513.318.77.788.77 1.41c0 .435-.114.83-.343 1.185c-.23.355-.54.735-.93 1.14c-.39.405-.71.82-.96 1.244c-.25.425-.375.92-.375 1.488c0 .484.093.88.28 1.184c.188.305.45.54.782.706c.334.167.72.25 1.156.25c.25 0 .482-.03.69-.09c.21-.06.393-.144.552-.25c.16-.107.29-.23.404-.37c.114-.14.21-.3.288-.475l-1.15-.745Z"></path></svg>
                Apple
              </Button>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Microsoft
              </Button>
              <Button variant="outline">
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
        </CardContent>
      </Card>
    </div>
  );
}
