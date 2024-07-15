"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

import { useState } from "react";
import { Button } from "./button";

export function ModeToggle() {
  const { setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    if (isDarkMode) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };
  return (
    <Button variant={"outline"} onClick={toggleDarkMode}>
      {isDarkMode ? (
        <MoonIcon className="mr-2 h-5 w-5" />
      ) : (
        <SunIcon className="mr-2 h-5 w-5" />
      )}
      {isDarkMode ? "Dark Mode" : "Light Mode"}
    </Button>
  );
}
