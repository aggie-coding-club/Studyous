"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from '../supabase-client';

import SearchBar from "./CourseSearchBar";
import CreateVideoButton from "./CreateVideoButton";
import ProfileDropdown from "./ProfileDropdown";
import Image from "next/image";

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }} = await supabase.auth.getUser();

      if (!user) {
        setLoggedIn(false)
      }
      else {
        setLoggedIn(true);
      }
      return;
    };
    checkAuth();
  })

  const hideSearch = pathname === "/login" || pathname === "/create_account" || pathname === "/profile";
  return (
    <nav className="relative flex items-center justify-center h-24 bg-[#500000] text-white shadow-md">
      {/* Title on the left */}
      <h1 className="absolute left-4 font-bold text-lg cursor-pointer hover:scale-105 transition-transform duration-150 ml-4" 
        onClick={() => setTimeout(() => router.push('/'), 1000)}>
          Studyous
      </h1>

      {/* Centered search bar */}
      {!hideSearch && (
        <div className="w-full max-w-md relative z-10">
          <SearchBar />
        </div>
      )}

      {/* Create Video Button */}
      {!hideSearch && (
        <div className="absolute right-35 cursor-pointer hover:scale-105 transition-transform duration-150">
          <CreateVideoButton />
        </div>
      )}

      {/* Profile Icon Dropdown */}
      {!hideSearch && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 border border-black">
          {loggedIn ? (
              <ProfileDropdown />
          ) : (
            <button
              onClick={() => setTimeout(() => router.push('/login'), 1000)}
              className="bg-[#500000] text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 hover:scale-105 transition-colors shadow-md border"
            >
              Sign In
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
