import { useEffect } from "react";
import { useLocation } from "wouter";

export default function OwnerLogin() {
  const [, setLocation] = useLocation();
  useEffect(() => setLocation("/sign-in", { replace: true }), [setLocation]);
  return null;
}