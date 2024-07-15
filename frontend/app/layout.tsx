"use client";
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/theme-toggle";
import StoreProvider from "./StoreProvider";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, usePathname } from "next/navigation";
import axiosInstance from "@/lib/utils/axiosInstance";
import axios from "axios";

const fontHeading = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  const { toast } = useToast();
  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function handleIsLoggedIn() {
      try {
        const { data } = await axiosInstance.get("/auth/is-logged-in");
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 401 &&
          pathName !== "/login" &&
          pathName !== "/signup"
        ) {
          toast({
            variant: "destructive",
            title: "User is not Logged in",
            description: "Please log in to continue",
          });
          router.push("/login");
        }
      }
    }

    handleIsLoggedIn();
  }, [pathName, router, toast]);

  return (
    <html lang="en">
      <body
        className={
          cn("antialiased", fontHeading.variable, fontBody.variable) +
          " flex flex-col min-h-screen"
        }
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <header className=" ml-auto px-8 py-8">
              <ModeToggle />
            </header>
            <main className=" flex-1 grid place-items-center">{children}</main>
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
