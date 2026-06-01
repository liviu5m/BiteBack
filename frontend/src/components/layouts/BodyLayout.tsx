import React from "react";
import type { ReactNode } from "react";
import Sidebar from "../elements/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

const BodyLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen h-full bg-[#FAF7F2] flex justify-between gap-10 w-full">
      <Sidebar />
      <div className="w-[350px]"></div>
      <main className="h-full">{children}</main>
    </div>
  );
};

export default BodyLayout;
