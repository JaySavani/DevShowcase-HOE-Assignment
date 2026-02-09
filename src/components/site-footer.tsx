import Link from "next/link";

import { ExternalLink, Github, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-card/50 border-t backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-foreground text-sm font-semibold tracking-tight">
              Jay Savani
            </p>
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://jaysavani.site/"
              target="_blank"
              rel="noreferrer"
              className="group text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Portfolio</span>
            </Link>
            <Link
              href="https://github.com/JaySavani"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">GitHub</span>
            </Link>
            <Link
              href="https://www.linkedin.com/in/jaysavani1025/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Linkedin className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
