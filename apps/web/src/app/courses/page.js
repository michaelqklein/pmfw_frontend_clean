"use client";

import Link from "next/link";

export default function CoursesIndexPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
      <p className="mt-2 text-gray-700">Choose a course to begin.</p>

      <div className="mt-6 grid gap-4">

        <Link href="/courses/musical-intervals-theory">
          <div className="cursor-pointer rounded-xl border-2 border-green-200 bg-white p-4 shadow-sm hover:border-green-400 transition-colors">
            <div className="text-xl font-semibold text-gray-800">Musical Intervals - Introduction and Theory</div>
            <div className="text-gray-600">Coming soon</div>
          </div>
        </Link>

        <Link href="/courses/ascending-intervals">
          <div className="cursor-pointer rounded-xl border-2 border-green-200 bg-white p-4 shadow-sm hover:border-green-400 transition-colors">
            <div className="text-xl font-semibold text-gray-800">Ascending Intervals - Ear Training</div>
            <div className="text-gray-600">10 lessons</div>
          </div>
        </Link>

      </div>
    </div>
  );
}


