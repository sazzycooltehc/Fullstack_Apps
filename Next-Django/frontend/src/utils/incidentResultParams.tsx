"use client";

import { useSearchParams } from "next/navigation";
import { ComponentType } from "react";

export function incidentParams<P>(WrappedComponent: ComponentType<P & { searchParams: URLSearchParams }>) {
  return function Wrapper(props: P) {
    const searchParams = useSearchParams();
    return <WrappedComponent {...props} searchParams={searchParams} />;
  };
}
