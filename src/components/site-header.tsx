"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Code2,
  FolderOpen,
  LayoutDashboard,
  LogIn,
  Menu,
  Plus,
  Shield,
  UserPlus,
  X,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Explore", icon: Code2 },
  { href: "/submit", label: "Submit Project", icon: Plus },
  { href: "/my-projects", label: "My Projects", icon: FolderOpen },
];

const adminItems = [
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Code2 className="text-primary-foreground h-4.5 w-4.5" />
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">
            DevShowcase
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="bg-border mx-2 h-5 w-px" />
          {adminItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Shield className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/sign-in">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Button>
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="bg-card border-t px-4 pt-2 pb-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {[...navItems, ...adminItems].map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="my-2 border-t" />
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="flex-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 bg-transparent"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link
                href="/sign-up"
                className="flex-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button size="sm" className="w-full gap-2">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
