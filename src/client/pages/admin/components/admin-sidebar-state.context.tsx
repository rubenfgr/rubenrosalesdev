import React from "react";
import { useIsMobile } from "@/client/hooks/use-mobile";

export const AdminSidebarStateContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
}>({
  open: true,
  setOpen: () => {},
  isMobile: false,
});

export const AdminSidebarStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(true);
  const isMobile = useIsMobile();
  return (
    <AdminSidebarStateContext.Provider value={{ open, setOpen, isMobile }}>
      {children}
    </AdminSidebarStateContext.Provider>
  );
};
