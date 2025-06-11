"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "./components/button";
import { useUserContext } from "@/context/userContext";
import { useBusinessContext } from "@/context/businessContext";

export default function Home() {
  const { user } = useUserContext();
  const { business } = useBusinessContext();
  const router = useRouter();
  return (
    <div className="w-[100vw] h-[100vh] flex flex-col">
      <div className="h-[15%] flex items-center justify-center px-12 py-4">
        <Image
          src="/logo.png"
          alt="Logo of Rategate"
          width={135}
          height={50}
          priority
        />
        {user._id !== "" && business._id !== "" ? (
          <div className="ml-auto">
            <Button
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover-bg-primary-hover text-white justify-center"
              buttonText="Dashboard"
              onClick={() =>
                router.push(
                  `/application/${user._id}/${business._id}/dashboard`
                )
              }
            />
          </div>
        ) : (
          <div className="ml-auto">
            <Button
              buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover-bg-primary-hover text-white justify-center"
              buttonText="Login"
              onClick={() => router.push("/login")}
            />
          </div>
        )}
      </div>
      <div className="h-[85%] flex items-center justify-center">
        <div className="w-[350px] lg:w-[500px] border border-stroke/30 flex items-center flex-col gap-8 py-12">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-2xl lg:text-3xl leading-[1.6] text-heading font-archivo font-bold max-w-[90%]">
              Welcome to Rategate.
            </h1>
            <p className="text-sm lg:text-base leading-6 text-heading w-[80%] text-center">
              {`your one and only platform to collect reviews and monitor your
            employee's performance.`}
            </p>
          </div>
          <Button
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-primary hover-bg-primary-hover text-white w-[250px] justify-center my-6"
            buttonText="Get Started for Free"
            onClick={() => router.push("/register")}
          />
        </div>
      </div>
    </div>
  );
}
