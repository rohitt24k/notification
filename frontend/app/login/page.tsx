"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/utils/axiosInstance";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();

  async function handleUserLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const email = (form.elements.namedItem("email") as HTMLInputElement)
        .value;
      const password = (form.elements.namedItem("password") as HTMLInputElement)
        .value;

      const { data } = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      console.log(data);

      toast({
        title: "Login successful",
        description: "You have been logged in",
      });
      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.response?.data?.error,
        });
      }
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUserLogin}>
        <CardContent className="grid gap-4">
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a password"
              required
            />
          </div>
          <Button className="w-full">Sign in</Button>
        </CardContent>
      </form>
      <CardFooter className=" justify-center mt-2">
        <div className="text-center text-sm">
          Don&apos;t have an account?
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
