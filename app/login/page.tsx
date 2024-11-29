"use client";

import { useUserContext } from "@/context/userContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "../components/input";
import ApiError from "../components/api-error";
import Button from "../components/button";
import { postData } from "@/utils/fetch";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    emailError: "",
    passwordError: "",
    apiError: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // CONTEXT
  const { setUser } = useUserContext();

  function checkEmail() {
    if (!email) {
      setError((error) => ({
        ...error,
        emailError: "Email is required",
      }));
      return false;
    }
    if (!email.includes("@")) {
      setError((error) => ({
        ...error,
        emailError: "Please enter a valid email",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      emailError: "",
    }));
    return true;
  }

  function checkPassword() {
    if (!password) {
      setError((error) => ({
        ...error,
        passwordError: "Password is required",
      }));
      return false;
    }
    setError((error) => ({
      ...error,
      passwordError: "",
    }));
    return true;
  }

  async function handleLogin() {
    const ALL_CHECKS_PASS = [checkPassword(), checkEmail()].every(Boolean);

    if (!ALL_CHECKS_PASS) return;

    setIsLoading(true);
    try {
      const response = await postData("/api/login", {
        email,
        password,
      });
      const { data } = response;
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("userId", data._id);
          localStorage.setItem("token", data.token);
        }
      } catch (error) {
        console.error("Error while setting token in localStorage:", error);
      }
      setUser(data);
      if (!data?.isVerified) {
        return router.push(`/email-not-verified`);
      }
      return router.push(`/application/${data?._id}/dashboard`);
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
    <main className="flex items-center bg-background">
      <div className="bg-white h-[100vh] w-[50%]">
        <div className="py-8 px-6">
          <img src="./logo.png" alt="Rategate Logo" className="h-8" />
        </div>
        <div className="py-12 w-full flex flex-col items-center">
          <div className="flex flex-col w-[400px] gap-12">
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-4xl leading-8 text-heading font-archivo font-bold">
                Login
              </h1>
              <p className="text-base leading-6 text-subHeading w-[80%] text-center mx-auto">
                By logging into your account, you agree to our
                <span>
                  <Link
                    href={"google.com"}
                    target="_blank"
                    className="font-bold text-primary hover:text-primaryHover underline px-1"
                  >
                    Terms
                  </Link>
                </span>
                and
                <span>
                  <Link
                    href={"google.com"}
                    target="_blank"
                    className="font-bold text-primary hover:text-primaryHover underline px-1"
                  >
                    Privacy
                  </Link>
                </span>
                Policy.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <form className="pt-4">
                <Input
                  type="email"
                  value={email}
                  label="Email"
                  placeholder="Enter your email address"
                  onChange={(event) => setEmail(event.target.value)}
                  error={error.emailError}
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  value={password}
                  label="Password"
                  placeholder="Enter your password"
                  onChange={(event) => setPassword(event.target.value)}
                  error={error.passwordError}
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
                <Button
                  isDisabled={isLoading}
                  isLoading={isLoading}
                  buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover:bg-primaryHover text-white w-full justify-center mx-auto my-6"
                  buttonText="Log In"
                  onClick={() => handleLogin()}
                />
                <p className="text-center text-subHeading">
                  Do not have an account?{" "}
                  <span className="text-accent">
                    <Link
                      href={"/register"}
                      className="text-primary hover:text-primaryHover font-bold underline text-md leading-md"
                    >
                      Sign Up
                    </Link>
                  </span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[50%] h-full flex flex-col items-center gap-8">
        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-2xl text-subHeading leading-7">
            Welcome to Rategate
          </h2>
          <p className="text-base leading-6 text-subHeading">
            {"First things first, let’s set you up with an account.👋🏼"}
          </p>
        </div>
        <img
          src="./auth-illustration.png"
          alt="Auth Illustration"
          className="h-[400px]"
        />
      </div>
    </main>
  );
}
