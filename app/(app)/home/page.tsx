"use client"
import React, { useCallback, useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'
import axios from 'axios';
import { Video } from '@/types';

function VideoCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-xl overflow-hidden">
      <div className="skeleton aspect-video w-full rounded-none" />
      <div className="card-body p-4">
        <div className="skeleton h-6 w-3/4" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-2/3" />
        </div>
        <div className="skeleton h-4 w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-3 w-12" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-8 w-12 rounded-btn" />
        </div>
      </div>
    </div>
  )
}

function Home() {

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  const fetchVideos = useCallback(async () => {
    try {
      setError(null);
      const res = await axios.get("/api/videos");

      if (Array.isArray(res.data)) {
        setVideos(res.data);
      } else {
        throw new Error("Unexpected response format")
      }

    } catch (error) {
      console.log(error);
      setError("Failed to fetch video");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchVideos()
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchVideos])



  const handleDownload = useCallback((url: string, title: string) => {

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute("download", `${title}.mp4`)
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Videos</h1>
          <p className="text-sm text-base-content/60">Your uploaded videos and compressed versions</p>
        </div>
        {loading && <span className="loading loading-spinner text-primary" />}
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <VideoCardSkeleton key={index} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-base-300 py-16 text-center text-lg text-base-content/60">
          No videos available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDownload={handleDownload}
              />
            ))
          }
        </div>
      )}
    </div>
  )
}

export default Home
