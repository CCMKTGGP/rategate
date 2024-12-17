"use client";
import { IEmployee } from "@/app/api/employee/interface";
import ApiError from "@/app/components/api-error";
import Button from "@/app/components/button";
import Input from "@/app/components/input";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/topbar";
import { fetchData, putData } from "@/utils/fetch";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function EditEmployeeClient({
  employeeId,
}: {
  employeeId: string;
}) {
  const router = useRouter();

  const [fetchEmployeeDetailsLoading, setFetchEmployeeDetailsLoading] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<IEmployee>({
    name: "",
    employee_id: "",
  });
  const [error, setError] = useState({
    nameError: "",
    employeeIdError: "",
    getApiError: "",
    putApiError: "",
  });
  const { name, employee_id } = state;

  useEffect(() => {
    async function getLocationDetails() {
      try {
        const { data } = await fetchData(`/api/employee/${employeeId}`);
        setState(data);
      } catch (err: any) {
        setError((error) => ({
          ...error,
          getApiError: err.message,
        }));
      } finally {
        setFetchEmployeeDetailsLoading(false);
      }
    }
    if (employeeId) {
      setFetchEmployeeDetailsLoading(true);
      getLocationDetails();
    }
  }, [employeeId]);

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
    if (!employee_id) {
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

  async function handleUpdateEmployee() {
    setIsLoading(true);
    try {
      const response = await putData(`/api/employee/${employeeId}`, {
        data: {
          name,
          employee_id,
        },
      });
      const { message } = response;
      console.log(message);
      router.back();
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
              Update Employee
            </h3>
            <p className="text-base leading-[24px] font-medium text-subHeading ">
              Update your employee
            </p>
          </div>
          {error.getApiError && (
            <ApiError
              message={error.getApiError}
              setMessage={(value) =>
                setError((error) => ({
                  ...error,
                  getApiError: value,
                }))
              }
            />
          )}
          {fetchEmployeeDetailsLoading ? (
            <p className="text-base leading-[24px] font-medium text-subHeading pt-6">
              Fetching employee Details...
            </p>
          ) : state._id ? (
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
                  value={employee_id}
                  placeholder="Enter the employee ID"
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      employee_id: event.target.value,
                    }))
                  }
                  error={error.employeeIdError}
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
                    onClick={() => router.back()}
                  />
                  <Button
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white"
                    buttonText="Update Team Member"
                    onClick={() => {
                      const ALL_CHECKS_PASS = [
                        checkEmployeeName(),
                        checkEmployeeId(),
                      ].every(Boolean);
                      if (!ALL_CHECKS_PASS) return;
                      handleUpdateEmployee();
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
