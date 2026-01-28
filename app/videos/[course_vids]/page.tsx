"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { supabase } from "../../supabase-client";
import { TAMU } from "../../colleges/college";
import Link from "next/link";
import VideoSearchBar from "../../components/VideoSearchBar";

type Video = {
  video_id: string;
  title: string;
  description: string | null;
  course_code: string;
  created_at: string;
  duration: number | null;
  video_url: string;
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]); 
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{course_vids: string}>();

  const course_vids = params.course_vids;

  const searchQuery = searchParams.get("search") || "";

  const course = TAMU.find((c) => c.code.toLowerCase() === (course_vids || "").toLowerCase());

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);

      let query = supabase
        .from("videos")
        .select("*")
        .eq("course_code", course_vids)

      if (searchQuery.trim() != "") {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const {data, error} = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        setVideos(data || []);
      }

      setLoading(false);
    };

    fetchVideos();
  }, [course_vids, searchQuery]);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim() == "") {
      params.delete("search");
    }
    else {
      params.set("search", value.trim());
    }

    router.push(`?${params.toString()}`);
  }

  return (
    <div className="p-8">
      {course && (
        <h1 className="text-3xl font-bold mb-6 text-center">
          {course.code} - {course.name}
        </h1>
      )}

      <div>
        <VideoSearchBar
          initialValue={searchQuery}
          onSearch={handleSearch}
        />
      </div>

      {loading ? (
        <p className="text-center">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="text-center">No videos for this course yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link
              key={video.video_id}
              href={`/watch/${video.video_id}`}
              className="block"
            >
              <div className="border rounded-lg shadow hover:shadow-xl transition p-4 cursor-pointer">
                <div className="w-full aspect-video bg-black rounded-md overflow-hidden mb-2">
                  <video
                    src={video.video_url}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/*Video Title*/}
                <h3 className="font-semibold">
                  {video.title}
                </h3>

                {/*Video Duration and Date*/}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  {video.duration && (
                    <span>
                      {Math.floor(video.duration / 60)}:
                      {String(video.duration % 60).padStart(2, "0")}
                    </span>
                  )}

                  <span>
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
