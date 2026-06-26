import React, { useCallback, useState } from 'react'
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary"
import { Download, Clock, FileDown, FileUp } from "lucide-react"
import dayjs from "dayjs";
import realtiveTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize"

import { Video } from '../types/index';


dayjs.extend(realtiveTime);


interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;

}

function VideoCard({ video, onDownload }: VideoCardProps) {

    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [previewError, setPreviewError] = useState<boolean>(false);

    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: "fill",
            gravity: "auto",
            format: "jpg",
            quality: "auto",
            assetType: "video"
        })
    }, [])

    const getFullVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 1920,
            height: 1080,
            rawTransformations: ["q_auto:low,f_mp4,vc_auto"]
        })
    }, [])

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: "fill",
            gravity: "auto",
            rawTransformations: ["so_0,du_15,q_auto:low,f_mp4"]

        })
    }, [])

    const formatSize = useCallback((size: number) => {
        return filesize(size);
    }, []);

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    const originalSize = Number(video.originalSize);
    const compressedSize = Number(video.compressedSize);
    const compressionPercentage =
        originalSize > 0 && compressedSize > 0
            ? Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
            : 0;
    const compressionLabel =
        compressionPercentage > 0 ? `${compressionPercentage}% smaller` : "No reduction";

    const handlePreviewError = () => {
        setPreviewError(true);
    }

    return (
        <div
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            onMouseEnter={() => {
                setPreviewError(false);
                setIsHovered(true);
            }}
            onMouseLeave={() => setIsHovered(false)}
        >
            <figure className="aspect-video relative">
                {isHovered ? (
                    previewError ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <p className="text-red-500">Preview not available</p>
                        </div>
                    ) : (
                        <video
                            src={getPreviewVideoUrl(video.publicId)}
                            poster={getThumbnailUrl(video.publicId)}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                            onError={handlePreviewError}
                        />
                    )
                ) : (
                    <img
                        src={getThumbnailUrl(video.publicId)}
                        alt={video.title}
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute bottom-2 right-2 bg-base-100 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                    <Clock size={16} className="mr-1" />
                    {formatDuration(video.duration)}
                </div>
            </figure>
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-bold">{video.title}</h2>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    {video.description}
                </p>
                <p className="text-sm text-base-content opacity-70 mb-4">
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                        <FileUp size={18} className="mr-2 text-primary" />
                        <div>
                            <div className="font-semibold">Original</div>
                            <div>{formatSize(originalSize)}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FileDown size={18} className="mr-2 text-secondary" />
                        <div>
                            <div className="font-semibold">Compressed</div>
                            <div>{formatSize(compressedSize)}</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm font-semibold">
                        Compression:{" "}
                        <span className="text-accent">{compressionLabel}</span>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                            onDownload(getFullVideoUrl(video.publicId), video.title)
                        }
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoCard
