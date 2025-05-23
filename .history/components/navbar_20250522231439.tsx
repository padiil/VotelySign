"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Vote,
  BarChart3,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const routes = [
    {
      href: "/",
      label: "Beranda",
      icon: Home,
      active: pathname === "/",
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
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-br from-emerald-600 to-teal-800">
              <Vote className="h-5 w-5 text-white" />
            </div>
            <span className="hidden md:inline-block text-xl font-bold bg-gradient-to-r from-teal-700 to-emerald-600 bg-clip-text text-transparent">
              VotelySign
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={route.active ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-1 text-sm",
                    route.active
                      ? "bg-teal-700/90 hover:bg-teal-700"
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

        <div className="flex items-center gap-2">
          {electionCode && (
            <Badge
              variant="outline"
              className="hidden sm:flex text-sm border-teal-700/40"
            >
              Code: <span className="font-mono ml-1">{electionCode}</span>
            </Badge>
          )}

          {onChangeElection && (
            <Button
              variant="outline"
              size="sm"
              onClick={onChangeElection}
              className="hidden sm:flex text-teal-700 border-teal-700/40 hover:bg-teal-50 hover:text-teal-800"
            >
              Ganti Pemilihan
            </Button>
          )}

          {userRole && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex gap-1 border border-gray-200"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Akun</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
                variant={route.active ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 text-sm mb-1",
                  route.active
                    ? "bg-teal-700/90 hover:bg-teal-700"
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
            <div className="px-2 py-1 text-sm text-gray-500">
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
              className="w-full justify-start text-teal-700"
            >
              Ganti Pemilihan
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
