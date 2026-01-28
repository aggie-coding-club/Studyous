'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase-client';
import { User } from '@supabase/supabase-js';
import Image from 'next/image';

type Profile = {
  first_name: string;
  last_name: string;
  username: string;
};

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load user + profile
  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('first_name, last_name, username')
        .eq('id', user.id)
        .single();

      setProfile(data);
    };

    loadUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndProfile();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    setTimeout(() => router.push('/login'), 1000);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Icon */}
      <Image
        src="/Nirvana.png"
        alt="Profile Logo"
        width={40}
        height={40}
        className="cursor-pointer hover:scale-120 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-[#500000] text-white rounded-md shadow-lg z-50">

          {/* SIGNED IN */}
          {user && profile && (
            <>
              <div className="px-4 py-3 border-b border-white/20">
                <p className="text-sm font-semibold break-words">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs opacity-80 break-words">
                  @{profile.username}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false); 
                  if (user) {
                    setTimeout(() => router.push(`/profile/${user.id}`), 1000);
                  }}}
                className="w-full text-left px-4 py-2 text-sm hover:bg-white/10"
              >
                View Profile
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-red-300"
              >
                Sign Out
              </button>
            </>
          )}

          {/* SIGNED OUT */}
          {!user && (
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/login');
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </div>
  );
}
