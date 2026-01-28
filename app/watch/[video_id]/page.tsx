"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase-client";
import { useParams, useRouter } from "next/navigation";

type Video = {
  video_id: string;
  title: string;
  description: string | null;
  course_code: string;
  created_at: string;
  duration: number | null;
  video_url: string;
  uploader_id: string;
};

type Profile = {
    id: string;
    username: string;
}

export default function watchPage() {
    const { video_id } = useParams();

    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploader, setUploader] = useState<Profile | null>(null);
    
    const router = useRouter();

    useEffect(() => {
        const fetchVideo = async () => {
            setLoading(true);
            setError("");

            const { data, error } = await supabase
                .from("videos")
                .select("*")
                .eq("video_id", video_id)
                .single();

            if (error || !data) {
                console.error("Error fetching video:", error);
                setError("Video not found.");
                setVideo(null);
            } else {
                setVideo(data);

                console.log("Uploader ID:", data.uploader_id);

                const { data: profileData, error: profileError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", data.uploader_id)
                    .single();
                
                if (profileError) {
                    console.error("error fetching uploader:", {
                        message: profileError.message,
                        code: profileError.code,
                        details: profileError.details,
                        hint: profileError.hint,
                        fullError: profileError,
                    });
                    setUploader(null);
                }
                else {
                    setUploader(profileData);
                }
            }
            setLoading(false);
        };

        if (video_id) {
            fetchVideo();
        }
    }, [video_id]);

    if (loading) {
        return (
            <div className="p-8 text-center text-white">
                Loading...
            </div>
            );
        }

    if (error) {
        return (
            <div className="p-8 text-center text-white">
                Error: {error}
            </div>
            );
        }

    if (!video) 
        {return (
            <div className="p-8 text-center text-white">
                Video not found
            </div>
            );
        }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Video */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                <video
                    src={video.video_url}
                    controls
                    className="w-full h-full"
                />
            </div>

            {/* Video Title */}
            <div className="text-2xl font-bold mt-4">
                {video.title}
            </div>

            {/* Uploader */}
            {uploader && (
                <div className="flex flex-wrap gap-2">
                    <div>
                        Uploaded by:
                    </div>

                    <div 
                        className="text-gray-300 font-medium cursor-pointer hover:scale-120 transition-transform" 
                        onClick={() => setTimeout(() => (router.push(`/profile/${video.uploader_id}`), 1000))}
                    > 
                        <u>
                            {uploader.username}
                        </u>
                    </div>
                </div>
            )}

            {/* Metadata and Description*/}
            <div className="bg-[#500000] rounded-lg p-6 shadow-md border mt-4">
                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400">
                    <span>
                        Uploaded {new Date(video.created_at).toLocaleDateString()}
                    </span>

                    {video.duration && (
                        <span>
                            Duration{" "}
                            {Math.floor(video.duration / 60)}:
                            {String(video.duration % 60).padStart(2, "0")}
                        </span>
                    )}

                    <span>
                        Course: {video.course_code}
                    </span>
                </div>
                
                {video.description && (
                    <p className="mt-4 text-gray-200 whitespace-pre-line">
                        {video.description}
                    </p>
                )}
            </div>
        </div>
    );
}