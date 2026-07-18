import React from "react";
import type { ReactNode } from "react";
import Sidebar from "../elements/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

const BodyLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen h-full bg-[#FAF7F2] flex flex-col md:flex-col lg:flex-row lg:justify-between w-full max-w-[100vw] pb-[72px] sm:pb-[76px] lg:pb-0 overflow-x-hidden">
      <Sidebar />
      <div className="hidden lg:block w-[280px] xl:w-[350px] shrink-0"></div>
      <main className="h-full w-full flex-1 min-w-0 overflow-x-hidden px-0 sm:px-0">{children}</main>
    </div>
  );
};

export default BodyLayout;
