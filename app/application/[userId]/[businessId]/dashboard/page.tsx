"use client";
import React, { useCallback, useEffect, useState } from "react";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { deleteData, fetchData } from "@/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ILocation } from "@/app/api/location/interface";
import DeleteModal from "@/app/components/delete-modal";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUserContext();
  const { business } = useBusinessContext();
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);
  const [successDeleteMessage, setSuccessDeleteMessage] = useState("");
  const [fetchLocationsLoading, setFetchLocationLoading] = useState(false);
  const [error, setError] = useState({
    apiError: "",
  });
  const [deleteModal, setDeleteModal] = useState<{
    toggle: boolean;
    data: ILocation;
  }>({
    toggle: false,
    data: {},
  });

  const fetchLocationsForBusiness = useCallback(async () => {
    try {
      const response = await fetchData(
        `/api/location?businessId=${business._id}`
      );
      const { data } = response;
      setLocations(data);
    } catch (err: any) {
      setError((error) => ({ ...error, apiError: err.message }));
    } finally {
      setFetchLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (business._id) {
      setFetchLocationLoading(true);
      fetchLocationsForBusiness();
    }
  }, [business]);

  // delete location api call
  async function handleDeleteLocation(locationId: string) {
    setDeleteProductLoading(true);
    try {
      const response = await deleteData(`/api/location/${locationId}`);
      const { message } = response;
      setSuccessDeleteMessage(message);
      setDeleteModal({
        toggle: false,
        data: {},
      });
      fetchLocationsForBusiness();
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setDeleteProductLoading(false);
    }
  }

  function renderLoadingOrTable() {
    if (fetchLocationsLoading) {
      return (
        <p className="text-base leading-[24px] font-medium text-subHeading pt-6">
          Fetching locations...
        </p>
      );
    }

    if (locations?.length <= 0) {
      return (
        <p className="text-base leading-[24px] font-medium text-subHeading pt-4">
          No Locations Found. Please create one.
        </p>
      );
    }

    return (
      <table className="mt-8 table">
        <thead>
          <tr className="rounded-[12px] border border-stroke/30">
            <th className="text-sm leading-4 w-[20%] text-left font-medium text-subHeading p-4">
              Branch Name
            </th>
            <th className="text-sm leading-4 w-[40%] text-left font-medium text-subHeading p-4">
              Branch Address
            </th>
            <th className="text-sm leading-4 w-[15%] text-left font-medium text-subHeading p-4">
              Team Members
            </th>
            <th className="text-sm leading-4 w-[15%] text-left font-medium text-subHeading p-4">
              Total Reviews
            </th>
            <th className="text-sm leading-4 w-[10%] text-left font-medium text-subHeading p-4">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {locations?.map((location: ILocation) => {
            return (
              <tr
                key={location._id}
                className="rounded-[12px] border border-stroke/30 group"
              >
                <td className="text-base leading-6 w-[20%] text-left font-medium text-subHeading p-4">
                  {location.name}
                </td>
                <td className="text-base leading-6 w-[40%] text-left font-medium text-subHeading p-4">
                  {location.address}
                </td>
                <td className="text-base leading-6 w-[15%] text-left font-medium text-subHeading p-4">
                  {location.total_members}
                </td>
                <td className="text-base leading-6 w-[15%] text-left font-medium text-subHeading p-4">
                  {location.total_reviews}
                </td>
                <td className="text-base leading-6 w-[10%] text-left font-medium text-subHeading p-2">
                  <div className="hidden group-hover:block">
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-primary"
                        onClick={() =>
                          router.push(
                            `/application/${user._id}/${business._id}/dashboard/update-location/${location?._id}`
                          )
                        }
                      >
                        <img
                          src="/Edit.svg"
                          alt="Edit Icon for location"
                          className="w-[16px]"
                        />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-error"
                        onClick={() =>
                          setDeleteModal({
                            toggle: true,
                            data: location,
                          })
                        }
                      >
                        <img
                          src="/Delete.svg"
                          alt="Delete Icon for location"
                          className="w-[16px]"
                        />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
  return (
    <div className="flex items-start bg-white">
      <Sidebar />
      <div className="flex-1 h-screen overflow-auto">
        <TopBar />
        <div className="px-8 py-4">
          <div className="flex flex-col pb-12">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Dashboard
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Manage your review platforms, add locations and team members
              below.
            </p>
            <div className="flex items-start gap-8 mt-6">
              <div className="w-[43%]">
                <div className="bg-white rounded-[12px] shadow-card border border-stroke/20 px-6 py-4">
                  <h4 className="text-lg leading-10 text-heading font-medium">
                    Status
                  </h4>
                  <p className="text-sm leading-4 text-subHeading">
                    Copy this link and start collecting reviews!
                  </p>
                  <div className="py-4">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business._id}/review`}
                      target="_blank"
                      className="text-lg font-bold text-heading break-words underline"
                    >
                      {`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.name}/review`}
                    </Link>
                  </div>
                  <div className="my-4 flex items-center gap-4">
                    <Link
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business._id}/review`}
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
              <div className="w-[57%]">
                <div className="bg-white rounded-[12px] shadow-card border border-stroke/20 px-6 py-4">
                  <h4 className="text-lg leading-10 text-heading font-medium">
                    {`Review Platforms (${business?.platforms?.length})`}
                  </h4>
                  <div className="mt-4 flex items-center gap-4 overflow-auto">
                    {business?.platforms.map((platform, index) => {
                      return (
                        <div
                          key={index}
                          className="min-w-[150px] max-w-[150px] min-h-[160px] max-h-[160px] bg-white border-2 border-stroke/40 rounded-[12px] flex flex-col items-center justify-center gap-6"
                        >
                          <Image
                            src={`/${platform.id}.svg`}
                            alt={`Logo of ${platform.name}`}
                            width={50}
                            height={50}
                            priority
                          />
                          <p className="text-sm leading-md text-heading text-center px-4">
                            {platform.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col pb-12">
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
          </div>
        </div>
        {deleteModal.toggle && (
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
        )}
      </div>
    </div>
  );
}
