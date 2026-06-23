"use client";

import React, { ChangeEvent } from "react";
import { useEffect, useState, useRef } from "react";
import { CldImage } from "next-cloudinary";
import axios from "axios";
import toast from "react-hot-toast";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats;

function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
    "Instagram Square (1:1)",
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
    }
  }, [selectedFormat, uploadedImage]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();

    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await axios.post("/api/image-upload", formData);

      const data = response.data;

      setUploadedImage(data.publicId);

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.log("upload failed",error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }

  };

  const handleDownload = () => {
    if (!imageRef.current) return;

    fetch(imageRef.current.src).then((response) => response.blob()).then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedFormat}.png`
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      


    })
  }

  return <div>SocialShare</div>;
}

export default SocialShare;
