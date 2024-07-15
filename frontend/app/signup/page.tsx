"use client";

import Link from "next/link";

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
import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/utils/axiosInstance";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const user = useAppSelector((state) => state.user);
  const { toast } = useToast();
  const router = useRouter();

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      const firstName = (
        form.elements.namedItem("first-name") as HTMLInputElement
      ).value;
      const lastName = (
        form.elements.namedItem("last-name") as HTMLInputElement
      ).value;
      const email = (form.elements.namedItem("email") as HTMLInputElement)
        .value;
      const password = (form.elements.namedItem("password") as HTMLInputElement)
        .value;

      const username = `${firstName} ${lastName}`;

      const { data } = await axiosInstance.post("/auth/signup", {
        username,
        email,
        password,
      });

      toast({
        description: "Signup successful",
      });
      router.push("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.response?.data?.error,
        });
        return;
      }
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "An error occurred while signing up",
      });
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" placeholder="Max" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" placeholder="Robinson" required />
              </div>
            </div>
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
              <Input id="password" type="password" />
            </div>
            <Button type="submit" className="w-full">
              Create an account
            </Button>
          </div>
        </CardContent>
      </form>
      <CardFooter className=" justify-center">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
