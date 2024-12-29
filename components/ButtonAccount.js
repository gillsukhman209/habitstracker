"use client";

import { useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { useSession, signOut } from "next-auth/react";
import apiClient from "@/libs/api";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Modal from "./Modal";

const ButtonAccount = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleBilling = async () => {
    setIsLoading(true);
    try {
      const { url } = await apiClient.post("/stripe/create-portal", {
        returnUrl: window.location.href,
      });
      window.location.href = url;
    } catch (e) {
      console.error("Error in handleBilling", e);
      toast.error("Failed to redirect to billing.");
    }
    setIsLoading(false);
  };

  const handleResetProgress = async () => {
    setIsModalOpen(true);
  };

  const confirmResetProgress = async () => {
    setIsModalOpen(false);
    try {
      const response = await fetch("/api/user/resetProgress", {
        method: "POST",
        body: JSON.stringify({ userId: session?.user?.id }),
      });

      if (response.ok) {
        toast.success("Progress reset successfully");
      } else {
        toast.error("Failed to reset progress");
      }
    } catch (error) {
      toast.error("An error occurred while resetting progress");
    }
  };

  // Don't render anything if the user is not authenticated
  if (status === "unauthenticated") return null;

  return (
    <Popover className="relative z-10">
      {({ open }) => (
        <>
          <Popover.Button className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 text-green-400 hover:bg-gray-700 hover:text-green-300 dark:bg-yellow-200 dark:text-gray-900 dark:hover:bg-yellow-300">
            {session?.user?.image ? (
              <Image
                src={session?.user?.image}
                alt={session?.user?.name || "Account"}
                className="w-6 h-6 rounded-full shrink-0"
                referrerPolicy="no-referrer"
                width={24}
                height={24}
              />
            ) : (
              <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
                {session?.user?.name?.charAt(0) ||
                  session?.user?.email?.charAt(0)}
              </span>
            )}

            <span className="hidden md:inline">
              {session?.user?.name || "Account"}
            </span>

            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={`w-5 h-5 duration-200 ${open ? "rotate-180" : ""}`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </Popover.Button>

          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="absolute left-0 z-10 mt-3 w-screen max-w-[16rem] transform">
              <div className="overflow-hidden rounded-xl shadow-xl ring-1 ring-gray-300 dark:ring-gray-600 bg-base-100 dark:bg-gray-800 p-1">
                <div className="space-y-1 text-sm">
                  <button
                    className="flex items-center gap-2 hover:bg-error/20 hover:text-error duration-200 py-1.5 px-4 w-full rounded-lg font-medium"
                    onClick={handleResetProgress}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 10.586l4.293 4.293a1 1 0 001.414-1.414L11.414 9.172l4.293-4.293A1 1 0 0014.293 2.293L10 6.586 5.707 2.293A1 1 0 004.293 3.707L8.586 8l-4.293 4.293A1 1 0 005.707 14.293L10 10.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Reset Progress
                  </button>
                  <button
                    className="flex items-center gap-2 hover:bg-error/20 hover:text-error duration-200 py-1.5 px-4 w-full rounded-lg font-medium"
                    onClick={handleSignOut}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </Popover.Panel>
          </Transition>

          {/* Modal for Reset Progress */}
          <Modal
            isModalOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <p className="text-black dark:text-white">
              This action is irreversible. Are you sure you want to reset your
              progress?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 text-black dark:bg-gray-700 dark:text-white rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={confirmResetProgress}
              >
                Confirm
              </button>
            </div>
          </Modal>
        </>
      )}
    </Popover>
  );
};

export default ButtonAccount;
