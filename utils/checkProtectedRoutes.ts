import { IUser } from "@/context/userContext";
import { PlanTypes } from "./planTypes";

export function isRouteProtected(url: string) {
  if (url.includes("/api/users")) {
    return true;
  }
  if (url.includes("/api/plans")) {
    return true;
  }
  if (url.includes("/api/business")) {
    return true;
  }
  return false;
}

export function isPaidUser(user: IUser) {
  return user?.plan?.plan_id?.toLowerCase() !== PlanTypes.BASIC.toLowerCase();
}
