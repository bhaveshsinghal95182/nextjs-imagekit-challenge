"use client";

import {useState} from "react";

import {useUser} from "@clerk/nextjs";

import {Button} from "@/components/ui/button";
import UploadModal from "@/components/upload/upload-modal";

import SignUpModal from "../auth/sign-up-modal";

const UploadButton = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  const {isLoaded, isSignedIn} = useUser();

  const handleUploadClick = () => {
    if (!isSignedIn) {
      setSignInModalOpen(true);
    } else {
      setUploadModalOpen(true);
    }
  };

  return (
    <>
      <Button
        className="cursor-pointer rounded-full bg-gradient-to-bl from-pink-400 to-pink-800 px-5 text-white"
        onClick={handleUploadClick}
      >
        Upload
      </Button>

      {/* Sign-up modal */}
      {signInModalOpen && (
        <SignUpModal open={signInModalOpen} onOpenChange={setSignInModalOpen} />
      )}

      {/* Upload modal */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadOptions={{
          folder: "/moments",
        }}
      />
    </>
  );
};

export default UploadButton;
