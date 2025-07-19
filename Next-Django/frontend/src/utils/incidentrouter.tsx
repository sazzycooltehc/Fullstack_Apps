// utils/incidentRouter.tsx
"use client";

import { useRouter } from "next/navigation";
import { ComponentType } from "react";

// HOC to inject App Router into class components
export function incidentRouter<P extends { router: ReturnType<typeof useRouter> }>(
  Component: ComponentType<P>
): ComponentType<Omit<P, "router">> {
  return function IncidentRouterWrapper(props: Omit<P, "router">) {
    const router = useRouter();
    return <Component {...(props as P)} router={router} />;
  };
}

