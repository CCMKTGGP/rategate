"use client";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { useBusinessContext } from "@/context/businessContext";
import { useUserContext } from "@/context/userContext";
import { postData } from "@/utils/fetch";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AddEmployeeClient({
  locationId,
}: {
  locationId: string;
}) {
  const router = useRouter();
  const { user } = useUserContext();
  const { business } = useBusinessContext();

  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState({
    name: "",
    employeeId: "",
  });
  const [error, setError] = useState({
    nameError: "",
    employeeIdError: "",
    apiError: "",
  });
  const { name, employeeId } = state;

  function checkEmployeeName() {
    if (!name) {
      setError((error) => ({
        ...error,
        nameError: "Employee Name is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      nameError: "",
    }));
    return true;
  }

  function checkEmployeeId() {
    if (!employeeId) {
      setError((error) => ({
        ...error,
        employeeIdError: "Employee Id is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      employeeIdError: "",
    }));
    return true;
  }

  async function handleAddEmployee() {
    setIsLoading(true);
    try {
      const response = await postData("/api/employee", {
        userId: user?._id,
        businessId: business._id,
        locationId,
        name,
        employeeId,
      });
      const { data } = response;
      window.location.href = data?.sessionUrl;
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
            <button
              type="button"
              className="text-heading underline font-medium text-md leading-md"
              onClick={() => router.back()}
            >
              Location Details
            </button>
          </div>
          <div className="flex flex-col pb-8">
            <h3 className="font-archivo text-2xl leading-[48px] text-heading font-semibold">
              Create Employee
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Create an employee. Each location is $5/Month
            </p>
          </div>
          <div className="bg-white rounded-[12px] w-[550px] px-6 py-8 shadow-card border border-stroke/30">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                label="Employee Name"
                value={name}
                placeholder="Enter name of the employee"
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                error={error.nameError}
                disabled={isLoading}
              />
              <Input
                type="text"
                label="Employee Id"
                value={employeeId}
                placeholder="Enter the employee ID"
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    employeeId: event.target.value,
                  }))
                }
                error={error.employeeIdError}
                disabled={isLoading}
              />
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
              <div className="flex flex-start items-center gap-6 mt-4">
                <Button
                  isDisabled={isLoading}
                  buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-[#F3F4F6] text-[#565E6C]"
                  buttonText="Cancel"
                  onClick={() => router.back()}
                />
                <Button
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
                  buttonText="Add Team Member"
                  onClick={() => {
                    const ALL_CHECKS_PASS = [
                      checkEmployeeName(),
                      checkEmployeeId(),
                    ].every(Boolean);
                    if (!ALL_CHECKS_PASS) return;
                    handleAddEmployee();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
