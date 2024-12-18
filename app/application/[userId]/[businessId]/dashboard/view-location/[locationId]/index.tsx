"use client";
import { IEmployee } from "@/app/api/employee/interface";
import { ILocation } from "@/app/api/location/interface";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import DeleteModal from "@/app/components/delete-modal";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import UpdatePlatforms from "@/app/components/update-platform";
import { PLATFORM_TYPES } from "@/app/components/update-platform/interface";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { deleteData, fetchData, postData } from "@/utils/fetch";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

export default function ViewLocationClient({
  locationId,
}: {
  locationId: string;
}) {
  const router = useRouter();
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  const downloadQrCodeRef = useRef<HTMLAnchorElement | null>(null);
  const [state, setState] = useState<ILocation>({});
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [fetchEmployeesLoading, setFetchEmployeesLoading] = useState(false);
  const [fetchingLocationDetails, setFetchingLocationDetails] = useState(false);
  const [toggleUpdatePlatformModel, setToggleUpdatePlatformModel] =
    useState(false);
  const [downloadLocationQrCodeLoading, setDownloadLocationQrCodeLoading] =
    useState(false);
  const [downloadEmployeeQrCodeLoading, setDownloadEmployeeQrCodeLoading] =
    useState<{
      loading: boolean;
      employeeId: string;
    }>({
      loading: false,
      employeeId: "",
    });
  const [deleteLocationLoading, setDeleteLocationLoading] = useState(false);
  const [deleteEmployeeLoading, setDeleteEmployeeLoading] = useState(false);
  const [_, setSuccessDeleteMessage] = useState("");
  const [error, setError] = useState({
    nameError: "",
    addressError: "",
    fetchLocationDetailsError: "",
    fetchMembersError: "",
  });
  const [deleteLocationModel, setDeleteLocationModel] = useState<{
    toggle: boolean;
    data: ILocation;
  }>({
    toggle: false,
    data: {},
  });
  const [deleteEmployeeModel, setDeleteEmployeeModel] = useState<{
    toggle: boolean;
    data: IEmployee;
  }>({
    toggle: false,
    data: {},
  });

  // extract the state here.
  const { _id, name, address, platforms } = state;

  // fetch location details in useEffect hook. This way, we only fetch when locationId changes.
  useEffect(() => {
    async function getLocationDetails() {
      try {
        const { data } = await fetchData(`/api/location/${locationId}`);
        setState(data);
        setFetchEmployeesLoading(true);
        fetchEmployeesForLocation(locationId);
      } catch (err: any) {
        setError((error) => ({
          ...error,
          fetchLocationDetailsError: err.message,
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

  // fetch all employees for a location
  const fetchEmployeesForLocation = useCallback(async (locationId: string) => {
    try {
      const response = await fetchData(
        `/api/employee?locationId=${locationId}`
      );
      const { data } = response;
      setEmployees(data);
    } catch (err: any) {
      setError((error) => ({ ...error, fetchMembersError: err.message }));
    } finally {
      setFetchEmployeesLoading(false);
    }
  }, []);

  async function handleDeleteLocation(locationId: string) {
    setDeleteLocationLoading(true);
    try {
      const response = await deleteData(`/api/location/${locationId}`);
      const { message } = response;
      setSuccessDeleteMessage(message);
      setDeleteLocationModel({
        toggle: false,
        data: {},
      });
      router.push(`/application/${user?._id}/${business._id}/dashboard`);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setDeleteLocationLoading(false);
    }
  }

  async function handleDeleteEmployee(employeeId: string) {
    setDeleteEmployeeLoading(true);
    try {
      const response = await deleteData(`/api/employee/${employeeId}`, {
        locationId: _id,
      });
      const { message } = response;
      setSuccessDeleteMessage(message);
      setDeleteEmployeeModel({
        toggle: false,
        data: {},
      });
      router.push(`/application/${user?._id}/${business._id}/dashboard`);
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setDeleteEmployeeLoading(false);
    }
  }

  // download QR code
  async function handleDownloadLocationQrCode() {
    setDownloadLocationQrCodeLoading(true);
    try {
      const response = await postData("/api/generate-qr-code", {
        data: `${process.env.NEXT_PUBLIC_BASE_URL}/business/${business._id}/review/${_id}`,
      });
      const { data } = response;
      const ref: any = downloadQrCodeRef?.current;
      ref.href = data.qrCodeUrl;
      ref.download = `${business.name}_location_${name}_qr_code.png`;
      ref.click();
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setDownloadLocationQrCodeLoading(false);
    }
  }

  // download employee QR code
  async function handleDownloadEmployeeQrCode(employee: IEmployee) {
    setDownloadEmployeeQrCodeLoading((prev) => ({
      ...prev,
      loading: true,
      employeeId: employee._id || "",
    }));
    try {
      const response = await postData("/api/generate-qr-code", {
        data: `${process.env.NEXT_PUBLIC_BASE_URL}/business/${business._id}/review/${_id}/${employee._id}`,
      });
      const { data } = response;
      const ref: any = downloadQrCodeRef?.current;
      ref.href = data.qrCodeUrl;
      ref.download = `${business.name}_location_${name}_employee_${employee.name}_qr_code.png`;
      ref.click();
    } catch (err: any) {
      setError((error) => ({
        ...error,
        apiError: err.message,
      }));
    } finally {
      setDownloadEmployeeQrCodeLoading((prev) => ({
        ...prev,
        loading: false,
        employeeId: "",
      }));
    }
  }

  function renderLoadingOrTable() {
    if (fetchEmployeesLoading) {
      return (
        <p className="text-base leading-[24px] font-medium text-subHeading pt-6">
          Fetching employees...
        </p>
      );
    }

    if (employees?.length <= 0) {
      return (
        <p className="text-base leading-[24px] font-medium text-subHeading pt-4">
          No Employee Found. Please create one.
        </p>
      );
    }

    return (
      <table className="mt-8 table">
        <thead>
          <tr className="rounded-[12px] border border-stroke/60">
            <th className="text-sm leading-4 w-[25%] text-left font-medium text-subHeading p-4">
              Employee Name
            </th>
            <th className="text-sm leading-4 w-[30%] text-left font-medium text-subHeading p-4">
              Employee Id
            </th>
            <th className="text-sm leading-4 w-[15%] text-left font-medium text-subHeading p-4">
              Total Reviews
            </th>
            <th className="text-sm leading-4 w-[15%] text-left font-medium text-subHeading p-4">
              QR Code
            </th>
            <th className="text-sm leading-4 w-[15%] text-left font-medium text-subHeading p-4">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {employees?.map((employee: IEmployee) => {
            return (
              <tr
                key={employee._id}
                className="rounded-[12px] border border-stroke/60 group"
              >
                <td className="text-base leading-6 w-[25%] text-left font-medium text-subHeading p-4">
                  {employee.name}
                </td>
                <td className="text-base leading-6 w-[30%] text-left font-medium text-subHeading p-4">
                  {employee.employee_id}
                </td>
                <td className="text-base leading-6 w-[15%] text-left font-medium text-subHeading p-4">
                  {employee.total_reviews}
                </td>
                <td className="w-[15%] text-left p-4">
                  {downloadEmployeeQrCodeLoading.employeeId === employee._id ? (
                    <div className="text-base font-medium text-subHeading leading-6">
                      Loading...
                    </div>
                  ) : (
                    <button
                      disabled={downloadEmployeeQrCodeLoading.loading}
                      className="text-base font-medium text-secondary leading-6 bg-transparent border-0 underline"
                      onClick={() => {
                        handleDownloadEmployeeQrCode(employee);
                      }}
                    >
                      Download
                    </button>
                  )}
                </td>
                <td className="text-base leading-6 w-[15%] text-left font-medium text-subHeading p-2">
                  <div className="hidden group-hover:block">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={downloadEmployeeQrCodeLoading.loading}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-primary"
                        onClick={() =>
                          router.push(
                            `/application/${user._id}/${business._id}/dashboard/view-location/${_id}/update-employee/${employee._id}`
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
                        disabled={downloadEmployeeQrCodeLoading.loading}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-error"
                        onClick={() =>
                          setDeleteEmployeeModel({
                            toggle: true,
                            data: employee,
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
          <div className="my-2">
            <Link
              href={`/application/${user?._id}/${business._id}/dashboard`}
              className="text-heading underline font-medium text-md leading-md"
            >
              Dashboard
            </Link>
          </div>
          {error.fetchLocationDetailsError && (
            <ApiError
              message={error.fetchLocationDetailsError}
              setMessage={(value) =>
                setError((error) => ({
                  ...error,
                  fetchLocationDetailsError: value,
                }))
              }
            />
          )}
          {fetchingLocationDetails ? (
            <p className="text-base leading-[24px] font-medium text-subHeading pt-6">
              Fetching location Details...
            </p>
          ) : _id ? (
            <div className="flex flex-col pb-12">
              <div className="flex items-center">
                <div>
                  <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                    {name}
                  </h3>
                  <p className="text-base leading-[24px] font-medium text-subHeading ">
                    {address}
                  </p>
                </div>
                <div className="my-4 flex items-center gap-4 ml-auto">
                  <Button
                    buttonClassName="px-4 py-2 rounded-md shadow-button hover:shadow-buttonHover bg-primary text-white"
                    buttonText="Edit"
                    onClick={() => {
                      router.push(
                        `/application/${user._id}/${business._id}/dashboard/update-location/${_id}`
                      );
                    }}
                  />
                  <Button
                    buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#FDE4E4] text-[#913838] px-4 py-2"
                    buttonText="Delete"
                    onClick={() =>
                      setDeleteLocationModel({
                        toggle: true,
                        data: state,
                      })
                    }
                  />
                </div>
              </div>
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
                        isLoading={downloadLocationQrCodeLoading}
                        isDisabled={downloadLocationQrCodeLoading}
                        buttonClassName="px-6 py-3 rounded-md shadow-button hover:shadow-buttonHover bg-secondary text-white"
                        buttonText="View QR code"
                        onClick={() => {
                          handleDownloadLocationQrCode();
                        }}
                      />
                    </div>
                    <a className="hidden" ref={downloadQrCodeRef}></a>
                  </div>
                </div>
                <div className="w-[57%]">
                  <div className="bg-white shadow-card border border-stroke/60 px-6 py-4">
                    <div className="flex items-center">
                      <h4 className="text-lg leading-10 text-heading font-medium">
                        {`Review Platforms (${platforms?.length})`}
                      </h4>
                      <div className="ml-auto">
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
                    </div>
                    <div className="mt-[34px] flex items-center gap-4 overflow-auto">
                      {platforms?.map((platform, index) => {
                        return (
                          <div
                            key={index}
                            className="min-w-[120px] max-w-[120px] min-h-[120px] max-h-[160px] bg-white border-2 border-stroke/60 rounded-[12px] flex flex-col items-center justify-center gap-4 py-4"
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
                              {platform.total_reviews} Revies
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className="flex flex-col pb-12">
            <div className="flex items-center gap-4 mb-4">
              <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
                Team Members
              </h3>
              <Button
                buttonClassName="px-6 py-3 rounded-md shadow-button hover:shadow-buttonHover bg-primary text-white"
                buttonText="Add Team Member"
                onClick={() => {
                  router.push(
                    `/application/${user._id}/${business._id}/dashboard/view-location/${_id}/add-employee`
                  );
                }}
              />
            </div>
            <p className="text-base leading-[24px] font-medium text-subHeading">
              This would be a one line description of what to expect on this
              page
            </p>
            {error.fetchMembersError && (
              <ApiError
                message={error.fetchMembersError}
                setMessage={(value) =>
                  setError((error) => ({
                    ...error,
                    fetchMembersError: value,
                  }))
                }
              />
            )}
            {renderLoadingOrTable()}
          </div>
        </div>
        {deleteLocationModel.toggle && (
          <DeleteModal
            heading="Delete Location"
            subHeading={`Are you sure you want to delete "${deleteLocationModel.data.name}"? Please keep in mind that these changes will not be reverted`}
            isLoading={deleteLocationLoading}
            onCancel={() =>
              setDeleteLocationModel({
                toggle: false,
                data: {},
              })
            }
            onConfirm={() =>
              handleDeleteLocation(deleteLocationModel.data._id || "")
            }
          />
        )}
        {deleteEmployeeModel.toggle && (
          <DeleteModal
            heading="Delete Employee"
            subHeading={`Are you sure you want to delete "${deleteEmployeeModel.data.name}"? Please keep in mind that these changes will not be reverted`}
            isLoading={deleteEmployeeLoading}
            onCancel={() =>
              setDeleteEmployeeModel({
                toggle: false,
                data: {},
              })
            }
            onConfirm={() =>
              handleDeleteEmployee(deleteEmployeeModel.data._id || "")
            }
          />
        )}
        {toggleUpdatePlatformModel && (
          <UpdatePlatforms
            locationId={_id}
            type={PLATFORM_TYPES.LOCATION}
            platforms={platforms || []}
            onCancel={() => setToggleUpdatePlatformModel(false)}
            onConfirm={() => window.location.reload()}
          />
        )}
      </div>
    </div>
  );
}
