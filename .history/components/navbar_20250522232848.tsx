"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Vote,
  BarChart3,
  Plus,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  electionCode?: string;
  onChangeElection?: () => void;
  userRole?: "admin" | "voter" | null;
}

export function Navbar({
  electionCode,
  onChangeElection,
  userRole,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { setTheme, theme } = useTheme();

  const routes = [
    {
      href: "/",
      label: "Beranda",
      icon: Home,
      active: pathname === "/",
    },
    {
      href: "/create",
      label: "Buat Pemilihan",
      icon: Plus,
      active: pathname === "/create",
      highlight: true,
    },
    {
      href: electionCode ? `/vote?code=${electionCode}` : "/vote",
      label: "Vote",
      icon: Vote,
      active: pathname === "/vote",
    },
    {
      href: electionCode ? `/live-count?code=${electionCode}` : "/live-count",
      label: "Live Count",
      icon: BarChart3,
      active: pathname === "/live-count",
    },
  ];

  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 supports-backdrop-blur:bg-white/60 dark:supports-backdrop-blur:bg-gray-900/60">
      <div className="container flex items-center">
        {/* Left Section - Logo */}
        <div className="flex-none">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-emerald-600 to-teal-800">
              <Vote className="h-5 w-5 text-white" />
            </div>
            <span className="hidden md:inline-block text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
              VotelySign
            </span>
          </Link>
        </div>

        {/* Center Section - Navigation Links */}
        <div className="flex-1 flex justify-center">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={
                    route.active
                      ? "default"
                      : route.highlight
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className={cn(
                    "gap-1 text-sm",
                    route.active
                      ? "bg-teal-700/90 hover:bg-teal-700"
                      : route.highlight
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section - ThemeToggle and other actions */}
        <div className="flex-none flex items-center gap-2">
          {electionCode && (
            <Badge
              variant="outline"
              className="hidden md:flex text-sm border-teal-700/40"
            >
              Code: <span className="font-mono ml-1">{electionCode}</span>
            </Badge>
          )}

          {onChangeElection && (
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeElection}
              className="hidden md:flex text-teal-700 border-teal-700/40 hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-teal-950"
            >
              Ganti Pemilihan
            </Button>
          )}

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden container pb-3 space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className="block">
              <Button
                variant={
                  route.active
                    ? "default"
                    : route.highlight
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 text-sm mb-1",
                  route.active
                    ? "bg-teal-700/90 hover:bg-teal-700"
                    : route.highlight
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-gray-700 dark:text-gray-300"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          ))}

          {electionCode && (
            <div className="px-2 py-1 text-sm text-gray-500 dark:text-gray-400">
              Election Code: <span className="font-mono">{electionCode}</span>
            </div>
          )}

          {onChangeElection && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsMenuOpen(false);
                onChangeElection();
              }}
              className="w-full justify-start text-teal-700 dark:text-teal-500"
            >
              Ganti Pemilihan
            </Button>
          )}

          {/* Mobile theme toggle */}
          <div className="px-2 py-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Theme
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
