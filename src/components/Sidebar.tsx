"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Upload, Clock, MessageSquare, GitCompare, AlertTriangle, Home, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", icon: Home, label: "Dashboard" },
  { href: "/app/upload", icon: Upload, label: "Upload Contracts" },
  { href: "/app/contracts", icon: FileText, label: "All Contracts" },
  { href: "/app/timeline", icon: Clock, label: "Obligation Timeline" },
  { href: "/app/ask", icon: MessageSquare, label: "Ask Contracts" },
  { href: "/app/compare", icon: GitCompare, label: "Compare Versions" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface/50 backdrop-blur-sm flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-border">
        <Link href="/app" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-tight">ContractLens</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">AI Contract Intelligence</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 text-white border border-indigo-500/30 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-indigo-400" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="glass rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success pulse-dot" />
            <span className="text-xs font-medium text-gray-300">Agent Active</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Monitoring {`${Math.floor(Math.random()*8)+3}`} obligations across your portfolio. Next scan in 4 hours.
          </p>
        </div>
      </div>
    </aside>
  );
}
