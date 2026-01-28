"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TAMU } from "../colleges/college";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement | null>(null);
  const router = useRouter();

  const q = query.toLowerCase();

  const filteredCourses = TAMU.filter(
    (course) =>
      course.code.toLowerCase().includes(q) ||
      course.name.toLowerCase().includes(q)
  );

  function goToCourse(code: string) {
    router.push(`/videos/${code}`);
    setQuery("");
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!filteredCourses.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredCourses.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCourses.length - 1
      );
    }

    if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      const selected = filteredCourses[highlightedIndex];
      setQuery(`${selected.code} - ${selected.name}`);
      setHighlightedIndex(-1);
    }
  };

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (
      highlightedIndex >= 0 &&
      listRef.current &&
      listRef.current.children[highlightedIndex]
    ) {
      const el = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;

      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search courses..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        className="w-full p-2 border rounded"
      />

      {query && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 w-full bg-white text-black border rounded mt-1 max-h-60 overflow-y-auto shadow-lg z-20"
        >
          {filteredCourses.length ? (
            filteredCourses.map((course, index) => (
              <li
                key={`${course.code}-${course.name}`}
                className={`p-2 cursor-pointer ${index === highlightedIndex? "bg-blue-500 text-white": "hover:bg-gray-100"}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {setQuery(`${course.code} - ${course.name}`); goToCourse(course.code)}}>
                {course.code} — {course.name}
              </li>
            ))
          ) : (
            <li className="p-2">No courses found</li>
          )}
        </ul>
      )}
    </div>
  );
}
