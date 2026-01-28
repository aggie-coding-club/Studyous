"use client";

import {useState, useEffect } from "react"
import { supabase } from "../supabase-client";
import Link from "next/link";

type Props = {
    initialValue?: string;
    onSearch: (value: string) => void;
}

export default function VideoSearchBar({initialValue = "", onSearch,} : Props) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(value.trim());
    };

    const handleClear = () => {
        setValue("");
        onSearch("");
    }

    return(
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 max-w-xl mx-auto mb-6"
        >
            <input
                type="text"
                placeholder="Search videos..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1 border rounded-md px-4 py-2 text-sm focus:ring-2"
            />

            <button
                type="submit"
                className="border text-white px-4 py-2 rounded-md text-sm hover:bg-red-900 transition"
            >
                Search
            </button>

            {value && (
                <button
                    type="submit"
                    onClick={handleClear}
                    className="border text-white px-4 py-2 rounded-md text-sm hover:bg-red-900 transition"
                >
                    Clear
                </button>
            )}
        </form>
    );
}