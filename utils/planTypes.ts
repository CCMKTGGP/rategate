import { IBusiness } from "@/context/businessContext";

export const PlanTypes = {
  BASIC: "basic",
  PROFESSIONAL: "professional",
  ENTERPRISE: "enterprise",
};

export function isPaidBusiness(business: IBusiness | undefined) {
  return (
    business?.plan_id?.plan_id.toLowerCase() !== PlanTypes.BASIC.toLowerCase()
  );
}
