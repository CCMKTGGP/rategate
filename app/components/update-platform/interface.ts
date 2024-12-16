import { IPlatform } from "@/app/api/location/interface";

export const PLATFORM_TYPES = {
  BUSINESS: "BUSINESS",
  LOCATION: "LOCATION",
};

export interface IUpdatePlatformsProps {
  businessId?: string;
  locationId?: string;
  type: string;
  platforms: Array<IPlatform>;
  onCancel: () => void;
  onConfirm: () => void;
}
