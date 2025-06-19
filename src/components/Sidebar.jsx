"use client";

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  MessageSquare,
  Bell,
  Settings,
  X,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Clienti",
    href: "/clients",
    icon: <Users className="h-5 w-5" />,
    role: "TRAINER", // Visibile solo ai pt
  },
  {
    title: "Schede Allenamento",
    href: "/workout-plans",
    icon: <Dumbbell className="h-5 w-5" />,
    role: "TRAINER", // Visibile solo ai pt
  },
  {
    title: "Scheda Allenamento",
    href: "/client/workout-plan",
    icon: <Dumbbell className="h-5 w-5" />,
    role: "CLIENT", // Visibile solo ai clienti
  },
  {
    title: "Messaggi",
    href: "/messages",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Notifiche",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "Impostazioni",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  const isTrainer = currentUser?.role === "TRAINER";

  return (
    <>
      {/* Sidebar per dispositivi desktop - FIXED */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-card border-r">
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-center border-b bg-card">
            <Link to={"/"}><img src="/coachy.png" alt="Logo" className=" w-full mr-2 dark:hidden" /></Link>
            <Link to={"/"}><img src="/coachy-dark.png" alt="Logo" className="hidden w-full mr-2 dark:block" /></Link>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems
                .filter((item) => {
                  if (!item.role) return true; // visibile a tutti
                  if (item.role === "TRAINER" && isTrainer) return true;
                  if (item.role === "CLIENT" && !isTrainer) return true;
                  return false;
                })
                .map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                ))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Sidebar mobile (Sheet) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex items-center justify-between h-16 border-b px-4">
            <span className="text-xl font-bold text-primary">CoachConnect</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems
                .filter(
                  (item) =>
                    isTrainer ||
                    (item.href !== "/clients" && item.href !== "/workout-plans")
                )
                .map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </Link>
                ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
