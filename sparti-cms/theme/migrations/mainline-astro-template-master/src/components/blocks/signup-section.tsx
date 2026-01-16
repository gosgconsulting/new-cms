import React from "react";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <g fill="none">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-1.6 4.2-5.4 4.2-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.6-4.8 9.6-7.3 0-.5 0-.8-.1-1.1H12z"/>
      <path fill="#34A853" d="M3.9 7.3 7.1 9.7C8 7.4 9.8 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3 14.7 2 12 2 8.6 2 5.7 3.8 3.9 7.3z" opacity=".9"/>
      <path fill="#FBBC05" d="M12 20.4c3.8 0 5.2-2.6 5.4-4.2H12v-3.9h9.5c.1.4.1.7.1 1.1 0 2.5-2.7 7.3-9.6 7.3z" opacity=".9"/>
      <path fill="#4285F4" d="M3.2 14.7c1.1 3 4 5.7 8.8 5.7 2.8 0 5.2-1 6.9-2.9l-3.2-2.5c-.9.6-2 1-3.7 1-3 0-5.6-2-6.5-4.7l-3.1 2.4z" opacity=".9"/>
    </g>
  </svg>
);

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";

const SignupSection = () => {
  return (
    <section className="py-28 lg:pt-44 lg:pb-32">
      <div className="container">
        <div className="flex flex-col gap-4">
          <Card className="mx-auto w-full max-w-sm">
            <CardHeader className="flex flex-col items-center space-y-0">
              <img
                src="/logo.svg"
                alt="logo"
                width={94}
                height={18}
                className="mb-7 dark:invert"
              />
              <p className="mb-2 text-2xl font-bold">Start your free trial</p>
              <p className="text-muted-foreground">
                Sign up in less than 2 minutes.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Input type="text" placeholder="Enter your name" required />
                <Input type="email" placeholder="Enter your email" required />
                <div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    required
                  />
                  <p className="text-muted-foreground mt-1 text-sm">
                    Must be at least 8 characters.
                  </p>
                </div>
                <Button type="submit" className="mt-2 w-full">
                  Create an account
                </Button>
                <Button variant="outline" className="w-full">
                  <GoogleIcon className="mr-2 size-5" />
                  Sign up with Google
                </Button>
              </div>
              <div className="text-muted-foreground mx-auto mt-8 flex justify-center gap-1 text-sm">
                <p>Already have an account?</p>
                <a href="/login" className="text-primary font-medium">
                  Log in
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;