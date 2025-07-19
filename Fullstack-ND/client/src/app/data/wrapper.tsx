"use client";

import { useRouter } from "next/navigation";
import IncidentData from "./page"; // your class component

export default function IncidentWrapper() {
  const router = useRouter();
  return <IncidentData router={router} />;
}
