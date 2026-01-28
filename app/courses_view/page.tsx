import Link from "next/link";
import { TAMU } from "../colleges/college";

export default function CoursesView() {
  return (
    <div className="p-6">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TAMU.map(course => (
          <Link
            key={course.code}
            href={`/courses_view/${course.code.replace(" ", "-")}`}
            className="group"
          >
            {/* Card */}
            <div className="flex flex-col">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden shadow group-hover:shadow-lg transition">
                <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-gray-600">
                  {course.code}
                </div>
              </div>

              {/* Info */}
              <div className="mt-3">
                <h3 className="font-semibold leading-tight">
                  {course.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {course.code}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
