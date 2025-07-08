"use client";
import Button from "@/app/components/button";
import { useRouter, useSearchParams } from "next/navigation";

const CustomErrorPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-center font-archivo text-2xl leading-[48px] text-heading font-semibold">
          Error: {searchParams.get("error")}
        </h1>
        <p className="text-center text-base leading-[24px] font-medium text-subHeading mx-auto">
          There was a error occured while Login. <br /> Please navigate back.
        </p>
        <div className="flex justify-center mt-6">
          <Button
            buttonClassName="rounded-md shadow-button hover:shadow-buttonHover bg-accent text-white"
            buttonText="Go To Login"
            onClick={() => router.push(`/login`)}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomErrorPage;
