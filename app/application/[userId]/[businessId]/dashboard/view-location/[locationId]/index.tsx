"use client";
import { ILocation } from "@/app/api/location/interface";
import Button from "@/app/components/button";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { fetchData } from "@/utils/fetch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ViewLocationClient({
  locationId,
}: {
  locationId: string;
}) {
  const router = useRouter();
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  const [state, setState] = useState<ILocation>({});
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
        setState(data);
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

  // extract the state here.
  const { _id, name, address } = state;

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
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              {name}
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              {address}
            </p>
            <div className="flex items-start gap-8 mt-6">
              <div className="w-[43%]">
                <div className="bg-white shadow-card border border-stroke/60 px-6 py-4">
                  <h4 className="text-lg leading-10 text-heading font-medium">
                    Status
                  </h4>
                  <p className="text-sm leading-4 text-subHeading">
                    Copy this link and start collecting reviews!
                  </p>
                  <div className="py-4">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business._id}/review/${_id}`}
                      target="_blank"
                      className="text-lg font-bold text-heading break-words underline"
                    >
                      {`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.name}/review/${name}`}
                    </Link>
                  </div>
                  <div className="my-4 flex items-center gap-4">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business._id}/review/${_id}`}
                      target="_blank"
                      className="px-8 py-3 rounded-md shadow-button hover:shadow-buttonHover bg-primary text-white"
                    >
                      View Customer Flow
                    </Link>
                    <Button
                      buttonClassName="px-6 py-3 rounded-md shadow-button hover:shadow-buttonHover bg-secondary text-white"
                      buttonText="View QR code"
                      onClick={() => {
                        console.log("Download QR Code API Call");
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="flex flex-col pb-12">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                Locations
              </h3>
              <Button
                buttonClassName="px-6 py-3 rounded-md shadow-button hover:shadow-buttonHover bg-primary text-white"
                buttonText="Add Location"
                onClick={() => {
                  router.push(
                    `/application/${user._id}/${business._id}/dashboard/add-location`
                  );
                }}
              />
            </div>
            <p className="text-base leading-[24px] font-medium text-subHeading">
              This would be a one line description of what to expect on this
              page
            </p>
            {error.apiError && (
              <ApiError
                message={error.apiError}
                setMessage={(value) =>
                  setError((error) => ({
                    ...error,
                    apiError: value,
                  }))
                }
              />
            )}
            {renderLoadingOrTable()}
          </div> */}
        </div>
        {/* {deleteModal.toggle && (
          <DeleteModal
            heading="Delete Location"
            subHeading={`Are you sure you want to delete "${deleteModal.data.name}"? Please keep in mind that these changes will not be reverted`}
            isLoading={deleteProductLoading}
            onCancel={() =>
              setDeleteModal({
                toggle: false,
                data: {},
              })
            }
            onConfirm={() => handleDeleteLocation(deleteModal.data._id || "")}
          />
        )} */}
      </div>
    </div>
  );
}
