import {
  Brain,
  Cpu,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LayoutTemplate,
  Rss,
  Search,
  Settings2,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

export const adminSidebarMenu = {
  user: {
    name: "rubenfgr",
    email: "rubenfranciscogr@outlook.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "admin.menu.dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "admin.menu.certifications",
      url: "/admin/certifications",
      icon: ShieldCheck,
    },
    {
      title: "admin.menu.blog",
      url: "/admin/blog",
      icon: Rss,
    },
    {
      title: "admin.menu.projects",
      url: "/admin/projects",
      icon: FolderKanban,
    },
    {
      title: "admin.menu.experience",
      url: "/admin/experience",
      icon: Brain,
    },
    {
      title: "admin.menu.techstack",
      url: "/admin/techstack",
      icon: Cpu,
    },
    {
      title: "admin.menu.profile",
      url: "/admin/profile",
      icon: UserCircle2,
    },
  ],
  navSecondary: [
    {
      title: "admin.menu.public",
      url: "/",
      icon: LayoutTemplate,
    },
    {
      title: "admin.menu.settings",
      url: "/admin/settings",
      icon: Settings2,
    },
    {
      title: "admin.menu.help",
      url: "/admin/help",
      icon: HelpCircle,
    },
    {
      title: "admin.menu.search",
      url: "/admin/search",
      icon: Search,
    },
  ],
};
