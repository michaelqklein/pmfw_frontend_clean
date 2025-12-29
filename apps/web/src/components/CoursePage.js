"use client";

export default function CoursePage({ course }) {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
        <p className="mt-2 text-gray-700">{course.description}</p>
      </div>

      {course.lessons.map((lesson, index) => (
        <div key={index} className="bg-white p-4 rounded-xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Lesson {index + 1}: {lesson.title}
          </h2>

          {lesson.videoUrl && (
            <video
              className="w-full rounded-lg"
              controls
              src={lesson.videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}

          {lesson.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-700">Notes</h3>
              <p className="text-gray-600 whitespace-pre-line">{lesson.notes}</p>
            </div>
          )}

          {lesson.pdfUrl && (
            <a
              href={lesson.pdfUrl}
              download
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              📄 Download PDF
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
