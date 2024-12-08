"use client";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { fetchData, putData } from "@/utils/fetch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditLocationClient({
  locationId,
}: {
  locationId: string;
}) {
  const router = useRouter();
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [fetchingLocationDetails, setFetchingLocationDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({
    nameError: "",
    addressError: "",
    getApiError: "",
    putApiError: "",
  });

  useEffect(() => {
    async function getLocationDetails() {
      try {
        const { data } = await fetchData(`/api/location/${locationId}`);
        setName(data.name);
        setAddress(data.address);
      } catch (err: any) {
        setError((error) => ({
          ...error,
          getApiError: err.message,
        }));
      } finally {
        setFetchingLocationDetails(false);
      }
    }
    if (locationId) {
      setFetchingLocationDetails(true);
      getLocationDetails();
    }
  }, [locationId]);

  function checkLocationName() {
    if (!name) {
      setError((error) => ({
        ...error,
        nameError: "Location Name is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      nameError: "",
    }));
    return true;
  }

  function checkAddress() {
    if (!address) {
      setError((error) => ({
        ...error,
        addressError: "Address is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      addressError: "",
    }));
    return true;
  }

  async function handleUpdateLocation() {
    const ALL_CHECKS_PASS = [checkLocationName(), checkAddress()].every(
      Boolean
    );
    if (!ALL_CHECKS_PASS) return;
    setIsLoading(true);
    try {
      const response = await putData(`/api/location/${locationId}`, {
        data: {
          name,
          address,
        },
      });
      const { message } = response;
      console.log(message);
      router.push(`/application/${user?._id}/${business._id}/dashboard`);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="flex items-start bg-white">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="my-2">
            <Link
              href={`/application/${user?._id}/${business._id}/dashboard`}
              className="text-heading underline font-medium text-md leading-md"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex flex-col pb-8">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Update Location
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Update your location
            </p>
          </div>
          {fetchingLocationDetails ? (
            <div className="flex items-center mt-8">
              <p className="text-lg font-medium text-subheading">
                Fetching location details...
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[12px] w-[550px] px-6 py-8 shadow-card border border-stroke/30">
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  label="Location Name"
                  value={name}
                  placeholder="Enter name of the location"
                  onChange={(event) => setName(event.target.value)}
                  error={error.nameError}
                  disabled={isLoading}
                />
                <Input
                  type="text"
                  label="Location Address"
                  value={address}
                  placeholder="Enter your full address"
                  onChange={(event) => setAddress(event.target.value)}
                  error={error.addressError}
                  disabled={isLoading}
                />
                {error.putApiError && (
                  <ApiError
                    message={error.putApiError}
                    setMessage={(value) =>
                      setError((error) => ({
                        ...error,
                        putApiError: value,
                      }))
                    }
                  />
                )}
                <div className="flex flex-start items-center gap-6 mt-4">
                  <Button
                    isDisabled={isLoading}
                    buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
                    buttonText="Cancel"
                    onClick={() => {
                      router.push(
                        `/application/${user?._id}/${business._id}/dashboard`
                      );
                    }}
                  />
                  <Button
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
                    buttonText="Update Location"
                    onClick={() => handleUpdateLocation()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
