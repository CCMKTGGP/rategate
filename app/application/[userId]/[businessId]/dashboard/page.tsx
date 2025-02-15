"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { deleteData, fetchData, postData } from "@/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ILocation } from "@/app/api/location/interface";
import DeleteModal from "@/app/components/delete-modal";
import ApiSuccess from "@/app/components/api-success";
import UpdatePlatforms from "@/app/components/update-platform";
import { PLATFORM_TYPES } from "@/app/components/update-platform/interface";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  const downloadQrCodeRef = useRef<HTMLAnchorElement | null>(null);
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [negativeReviews, setNegativeReviews] = useState(0);
  const [fetchNegativeReviewsLoading, setFetchNegativeReviewsLoading] =
    useState(true);
  const [downloadQrCodeLoading, setDownloadQrCodeLoading] = useState(false);
  const [deleteLocationLoading, setDeleteLocationLoading] = useState(false);
  const [successDeleteMessage, setSuccessDeleteMessage] = useState("");
  const [fetchLocationsLoading, setFetchLocationLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [toggleUpdatePlatformModel, setToggleUpdatePlatformModel] =
    useState(false);
  const [error, setError] = useState({
    shareError: "",
    apiError: "",
  });
  const [deleteModal, setDeleteModal] = useState<{
    toggle: boolean;
    data: ILocation;
  }>({
    toggle: false,
    data: {},
  });

  const fetchAllReviewsForBusiness = useCallback(async () => {
    try {
      const response = await fetchData(
        `/api/business-reviews?businessId=${business._id}`
      );
      const { data } = response;
      const filteredReviews = data.filter((review: any) => review.rating <= 3);
      setNegativeReviews(filteredReviews.length);
    } catch (err: any) {
      setError((error) => ({ ...error, apiError: err.message }));
    } finally {
      setFetchNegativeReviewsLoading(false);
    }
  }, []);

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
      fetchAllReviewsForBusiness();
    }
  }, [business]);

  // delete location api call
  async function handleDeleteLocation(locationId: string) {
    setDeleteLocationLoading(true);
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
      setDeleteLocationLoading(false);
    }
  }

  // download QR code
  async function handleDownloadQrCode() {
    setDownloadQrCodeLoading(true);
    try {
      const response = await postData("/api/generate-qr-code", {
        data: `${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.slug}/review`,
      });
      const { data } = response;
      const ref: any = downloadQrCodeRef?.current;
      ref.href = data.qrCodeUrl;
      ref.download = `${business.name}_qr_code.png`;
      ref.click();
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setDownloadQrCodeLoading(false);
    }
  }

  // share url
  async function handleShare() {
    if (!navigator.share) {
      setError((error) => ({
        ...error,
        shareError: "Web Share API is not supported in your browser.",
      }));
      return;
    }

    try {
      await navigator.share({
        title: "How Did We Do? Let Us Know!",
        text: "Your feedback helps us improve. Please take a moment to let us know your thoughts",
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.slug}/review`,
      });
    } catch (err) {
      console.log("Error sharing:", err);
      setError((error) => ({
        ...error,
        shareError: "Failed to share the content.",
      }));
    }
  }

  // copy url
  function handleCopy() {
    try {
      navigator.clipboard
        .writeText(
          `${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.slug}/review`
        )
        .then(() => {
          setCopySuccess("Copied to clipboard!");
          setTimeout(() => setCopySuccess(""), 3000); // Clear the message after 3 seconds
        });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setError((error) => ({
        ...error,
        copyError: "Failed to copy the content.",
      }));
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
      <table className="mt-4 table">
        <thead>
          <tr className="rounded-[12px] border border-stroke/60">
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
                className="rounded-[12px] border border-stroke/60 group"
              >
                <td className="text-base leading-6 w-[20%] text-left font-bold text-primary p-4 underline">
                  <Link
                    href={`/application/${user._id}/${business._id}/dashboard/view-location/${location._id}`}
                  >
                    {location.name}
                  </Link>
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
              Manage your review platforms, add locations, and team members
              below.
            </p>
            <div className="bg-white py-4 mt-8">
              <h4 className="text-lg leading-10 text-heading font-medium">
                Status
              </h4>
              <p className="text-sm leading-4 text-subHeading">
                Copy this link and start collecting reviews!
              </p>
              <div className="py-4 flex items-center gap-4">
                <Link
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.slug}/review`}
                  target="_blank"
                  className="text-lg font-bold text-heading break-words underline"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.slug}/review`}
                </Link>
                <div className="relative mt-2">
                  <button
                    type="button"
                    className="bg-transparent border-0"
                    onClick={() => handleCopy()}
                  >
                    <Image
                      src={`/copy.svg`}
                      alt="copy url icon"
                      width={20}
                      height={20}
                      priority
                    />
                  </button>
                  {copySuccess && (
                    <p className="text-sm leading-4 text-white font-medium bg-heading px-4 py-3 rounded-[8px] absolute left-[-80px] w-[200px] text-center">
                      {copySuccess}
                    </p>
                  )}
                </div>
              </div>
              <div className="my-4 flex items-center gap-4">
                <Button
                  isLoading={downloadQrCodeLoading}
                  isDisabled={downloadQrCodeLoading}
                  buttonClassName="px-6 py-3 rounded-md shadow-button hover:shadow-buttonHover bg-primary text-white"
                  buttonText="Download QR code"
                  icon={
                    <Image
                      src={`/download.svg`}
                      alt="download QR code icon"
                      width={20}
                      height={20}
                      priority
                    />
                  }
                  onClick={() => {
                    handleDownloadQrCode();
                  }}
                />
                <Button
                  isDisabled={downloadQrCodeLoading}
                  buttonClassName="px-6 py-3 rounded-md shadow-button hover:shadow-buttonHover text-white bg-secondary"
                  buttonText="Share"
                  icon={
                    <Image
                      src={`/Share.svg`}
                      alt="share url icon"
                      width={20}
                      height={20}
                      priority
                    />
                  }
                  onClick={() => {
                    handleShare();
                  }}
                />
                <Link
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/business/${business.slug}/customer-flow`}
                  target="_blank"
                  className="px-8 py-3 rounded-md hover:shadow-buttonHover text-primary bg-white font-semibold"
                >
                  View Customer Flow
                </Link>
                <a className="hidden" ref={downloadQrCodeRef}></a>
              </div>
            </div>
            <div className="bg-white py-4 mt-8">
              <div className="flex items-center gap-8">
                <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                  {`Review Platforms (${business?.platforms?.length})`}
                </h3>
                <button
                  type="button"
                  className="bg-transparent border-0 font-bold text-base text-primary"
                  onClick={() => {
                    setToggleUpdatePlatformModel(true);
                  }}
                >
                  Edit Platforms
                </button>
              </div>
              <div className="mt-4 flex items-center gap-4 overflow-auto">
                {business?.platforms.map((platform, index) => {
                  return (
                    <div
                      key={index}
                      className="min-w-[140px] max-w-[150px] min-h-[120px] max-h-[160px] bg-white border-2 border-stroke/60 rounded-[12px] flex flex-col items-center justify-center gap-4 py-4"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Image
                          src={`/${platform.id}.svg`}
                          alt={`Logo of ${platform.name}`}
                          width={40}
                          height={40}
                          priority
                        />
                        <p className="text-sm leading-md text-heading text-center px-2">
                          {platform.name}
                        </p>
                      </div>
                      <p className="text-base leading-md text-heading text-center px-2 font-bold">
                        {platform.total_reviews} Reviews
                      </p>
                    </div>
                  );
                })}
                <div className="min-w-[140px] max-w-[150px] min-h-[120px] max-h-[160px] bg-white border-2 border-stroke/60 rounded-[12px] flex flex-col items-center justify-center gap-4 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src={"/thumb-down.svg"}
                      alt={"Thumb Down Svg"}
                      width={40}
                      height={40}
                      priority
                    />
                    <p className="text-sm leading-md text-heading text-center px-2">
                      Negative Reviews
                    </p>
                  </div>
                  <p className="text-base leading-md text-heading text-center px-2 font-bold">
                    {fetchNegativeReviewsLoading
                      ? "Fetching..."
                      : `${negativeReviews} Reviews`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col pb-12 mt-4">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                Locations
              </h3>
              <Button
                isDisabled={
                  business?.plan_id?.max_locations !== null &&
                  locations.length >= business.plan_id.max_locations
                }
                buttonClassName="px-6 py-3 rounded-md shadow-button hover:shadow-buttonHover bg-primary text-white"
                buttonText="Add Location"
                onClick={() => {
                  router.push(
                    `/application/${user._id}/${business._id}/dashboard/add-location`
                  );
                }}
              />
            </div>
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
            {successDeleteMessage && (
              <ApiSuccess
                message={successDeleteMessage}
                setMessage={(value) => setSuccessDeleteMessage(value)}
              />
            )}
            {renderLoadingOrTable()}
          </div>
        </div>
        {deleteModal.toggle && (
          <DeleteModal
            heading="Delete Location"
            subHeading={`Are you sure you want to delete "${deleteModal.data.name}"? Please keep in mind that these changes will not be reverted`}
            isLoading={deleteLocationLoading}
            onCancel={() =>
              setDeleteModal({
                toggle: false,
                data: {},
              })
            }
            onConfirm={() => handleDeleteLocation(deleteModal.data._id || "")}
          />
        )}
        {toggleUpdatePlatformModel && (
          <UpdatePlatforms
            businessId={business._id}
            type={PLATFORM_TYPES.BUSINESS}
            platforms={business.platforms}
            onCancel={() => setToggleUpdatePlatformModel(false)}
            onConfirm={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}
