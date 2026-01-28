import Link from "next/link";
import { TAMU } from "./colleges/college";

export default function HomePage() {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {TAMU.map((course) => (
        <Link
          key={course.code}
          href={`/videos/${course.code}`}
          className="rounded-xl border p-4 hover:shadow-lg hover:bg-red-700 hover:scale-105 transition bg-[#500000]"
        >
          <h2 className="text-xl text-white font-bold">{course.name}</h2>
          <p className="text-white">{course.code}</p>
        </Link>
      ))}
    </div>
  );
}
