'use client';

import { createPortal } from "react-dom";
import { supabase } from "../supabase-client";
import { useState, useEffect } from "react";
import { TAMU } from "../colleges/college";

export default function CreateVideoButton() {
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isFormValid = title.trim() !== "" && courseCode !== "" && file !== null;

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    else {
      document.body.style.overflow = "";
      }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Get Video Duration
  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);

      video.preload = "metadata";
      video.src = objectUrl;
      video.muted = true;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);

        if (isNaN(video.duration) || video.duration === Infinity) {
          reject(new Error("Invalid video duration."));
        }
        else {
          resolve(Math.floor(video.duration))
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject("Failed to load video metadata.");
      };
    });
  };

  const handleUpload = async () => {
    setError("");

    if (!isFormValid) {
      setError("Please complete all fields and select a video file.");
      return;
    }
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to upload a video.");
        setLoading(false);
        return;
      }

      const fileExt = file!.name.split(".").pop()?.toLowerCase();
      const validExtensions = ["mp4", "mov", "avi", "webm", "mkv"];

      if (!fileExt || !validExtensions.includes(fileExt)) {
        setError("Please upload a valid video file (mp4, mov, avi, webm, mkv).");
        setLoading(false);
        return;
      }

      let duration: number | null = null;

      try {
        duration = await getVideoDuration(file!);
      } catch(metaErr) {
        console.warn("Could not read metadata:", metaErr);
        setError("Please upload a valid video file (mp4, mov, avi, webm, mkv).");
        setLoading(false);
        return;
      }

      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filePath, file!, { upsert: false });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("videos")
        .getPublicUrl(filePath);

      // Insert into 'videos' table
      const { error: insertError } = await supabase
        .from("videos")
        .insert({
          title: title.trim(),
          course_code: courseCode,
          description: description.trim() === "" ? null : description.trim(),
          duration,
          video_url: urlData.publicUrl,
          uploader_id: user.id,
        });

      if (insertError) {
        setError(`Failed to save video details: ${insertError.message}`);
      } else {
        alert("Video uploaded successfully!");
        setTitle("");
        setCourseCode("");
        setFile(null);
        setIsOpen(false);
      }
    } catch (err) {
      console.error("Unexpected upload error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#500000] text-white font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors shadow-md border"
      >
        {isOpen ? "Cancel Upload" : "+ Upload Video"}
      </button>

      {/* Upload Video Pop Up */}
      {mounted && isOpen && createPortal(
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="p-6 bg-[#500000] rounded-xl border shadow-lg max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-5">Upload a New Video</h3>

            <div className="space-y-5">
              {/* Video Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
                  Video Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Give your video a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#500000]"
                />
              </div>

              <div>
                {/* Video Description */}
                <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                  Video Description
                </label>
                <input
                  id="description"
                  type="text"
                  placeholder="Add a brief description of the video... (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#500000]">

                </input>
              </div>

              {/* Course Selection */}
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-white mb-1">
                  Course
                </label>
                <select
                  id="course"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#500000]
                      ${courseCode === "" ? "text-gray bg-[#500000]" : "text-white bg-[#500000]"}
                      `}>
                  <option value="">Select a course...</option>
                  {TAMU.map((course) => (
                    <option key={course.code} value={course.code}>
                      {course.code} – {course.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="videoFile" className="block text-sm font-medium text-white mb-1">
                  Video File
                </label>
                <input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;

                    if (!selected) {
                      setFile(null);
                      return;
                    }

                    const fileExt = selected.name.split(".").pop()?.toLowerCase();
                    const validExtensions = ["mp4", "mov", "avi", "webm", "mkv"];
                    
                    if (!fileExt || !validExtensions.includes(fileExt)) {
                      setError("Please select a valid video file (mp4, mov, avi, webm, mkv).");
                      setFile(null);

                      e.currentTarget.value = '';
                      return;
                    }

                    setFile(selected);
                    setError("");
                  }}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:text-sm file:font-semibold file:bg-[#500000] file:text-white hover:file:bg-[#500000]"
                />

                {file && (
                  <p className="mt-2 text-sm text-white">
                    Selected: <span className="font-medium">{file.name}</span> (
                    {(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-3">
                <button
                  onClick={() => {
                    setTitle("");
                    setCourseCode("");
                    setError("");
                    setFile(null);
                    setIsOpen(false);
                  }}
                  className="flex-1 py-2 px-4 bg-[#500000] hover:bg-red-900 text-white font-semibold rounded-md transition border"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpload}
                  disabled={loading || !isFormValid}
                  className="flex-1 py-2 px-4 bg-[#500000] hover:bg-red-900 text-white font-semibold rounded-md transition border"
                >
                  {loading ? "Uploading..." : "Upload Video"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}