'use client';

import { supabase } from '../../supabase-client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Profile = {
    id: string;
    first_name: string;
    last_name: string;
    username: string;
}

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

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const router = useRouter();
    const { id } = useParams();
    const profileId = Array.isArray(id) ? id[0] : id;

    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            setError('');

            if (!profileId || typeof profileId !== 'string') {
                setError('Invalid profile id.');
                setLoading(false);
                return;
            }

            const { data: {user} } = await supabase.auth.getUser();
            setCurrentUserId(user?.id ?? null);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', profileId)
                .single();

            if (error || !data) {
                setError('User not found.');
                setLoading(false);
                return;
            }
            setProfile(data);

            const { data: videosData, error: videosError } = await supabase
                .from('videos')
                .select('*')
                .eq('uploader_id', profileId)
                .order('created_at', { ascending: false });

            if (videosError) {
                console.error('Failed to load videos:', videosError);
            } else {
                setVideos(videosData || []);
            }

            if (user?.id !== profileId) {
                setIsEditing(false);
            } 

            setLoading(false);
        };
        
        loadProfile();
    }, [profileId]);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        setError('');

        const { error } = await supabase.from('users').update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            username: profile.username,
        }).eq('id', profile.id);

        if (error) {
            setError('Failed to update profile.');
        }
        setSaving(false);
    };

    if (loading) {
        return <p className = "mt-10 text-center">Loading...</p>
    }
    if (error) {
        return <p className = "mt-10 text-center text-red-500">{error}</p>
    }

    return (
        <div className="pb-16">
            {/* Profile Info */}
            <div className = "w-1/2 bg-[#500000] shadow-md rounded-lg mt-4 mx-auto">
                <div className="px-4 py-4 space-y-2">

                <div className="w-full flex justify-start">
                    {!isEditing ? (
                    <p className="text-white text-lg font-medium">
                        {profile?.first_name} {profile?.last_name}
                    </p>
                    ) : (
                    <div className="flex gap-2">
                        <input
                        value={profile?.first_name || ''}
                        onChange={(e) =>
                            setProfile({ ...profile!, first_name: e.target.value })
                        }
                        className="border p-1 text-sm rounded flex-1 min-w-0"
                        />
                        <input
                        value={profile?.last_name || ''}
                        onChange={(e) =>
                            setProfile({ ...profile!, last_name: e.target.value })
                        }
                        className="border p-1 text-sm rounded flex-1 min-w-0"
                        />
                    </div>
                    )}
                </div>

                <div className="w-full flex justify-start">
                    {!isEditing ? (
                    <p className="text-white text-lg font-medium">
                        @{profile?.username}
                    </p>
                    ) : (
                    <input
                        value={profile?.username || ''}
                        onChange={(e) =>
                        setProfile({ ...profile!, username: e.target.value })
                        }
                        className="border p-1 text-sm rounded flex-1 min-w-0"
                    />
                    )}
                </div>
            </div>
                {currentUserId === profile?.id && (
                    <div className="flex justify-end px-4 pb-4">
                        <button
                            disabled={saving}
                            onClick={() => {
                                if (isEditing) {
                                    handleSave();
                                }
                                setIsEditing(!isEditing);
                            }}
                            className="bg-black text-white px-1 py-1 text-sm rounded hover:bg-red-900">
                            {saving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                        </button>
                    </div>
                )}
            </div>

            {/* Uploaded Videos */}
            <div className="w-4/5 mx-auto mt-8">
                <h2 className="text-xl font-semibold mb-4 text-white">
                    Uploaded Videos
                </h2>

                {videos.length === 0 ? (
                    <p className="text-gray-300">
                        You haven't uploaded any videos yet.
                    </p>
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
        </div>
    );
}