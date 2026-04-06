import { type FC, type ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export const PageLayout: FC<PageLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative flex min-h-screen flex-col ${className}`.trim()}>
      {children}
    </div>
  );
};

export default PageLayout;
