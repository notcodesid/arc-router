import { Github, Twitter, MessageCircle } from "lucide-react";

const socials = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: MessageCircle, label: "Discord", href: "#" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/50">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding */}
        <div className="flex items-center gap-2.5">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
          >
            <rect width="32" height="32" rx="8" className="fill-primary" />
            <path
              d="M16 6L8 24h4l2-4.5h4L20 24h4L16 6Zm0 7.5L18.5 19h-5L16 13.5Z"
              className="fill-primary-foreground"
            />
            <path
              d="M10 26c3.5 1.5 8.5 1.5 12 0"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="stroke-primary-foreground/60"
              fill="none"
            />
          </svg>
          <span className="text-sm font-semibold tracking-tighter text-foreground">
            Arc Router
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        </div>

        {/* Socials */}
        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            >
              <s.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Arc Router. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
