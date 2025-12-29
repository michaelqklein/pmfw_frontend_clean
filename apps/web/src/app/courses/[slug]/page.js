import fs from "fs";
import path from "path";
import CoursePage from "@/src/components/CoursePage";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const coursesDir = path.join(process.cwd(), "..", "..", "packages", "data", "courses");
  const filenames = fs.readdirSync(coursesDir).filter((file) => file.endsWith(".json"));

  // Only include JSON files that look like Course data (must have an array `lessons`)
  const courseSlugs = filenames.filter((file) => {
    try {
      const content = fs.readFileSync(path.join(coursesDir, file), "utf8");
      const json = JSON.parse(content);
      return Array.isArray(json?.lessons);
    } catch {
      return false;
    }
  });

  return courseSlugs.map((file) => ({ slug: file.replace(".json", "") }));
}

export default async function CourseSlugPage({ params }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), "..", "..", "packages", "data", "courses", `${slug}.json`);
  let courseData;
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    courseData = JSON.parse(fileContents);
  } catch {
    notFound();
  }

  if (!courseData || !Array.isArray(courseData?.lessons)) {
    notFound();
  }

  return <CoursePage course={courseData} />;
}
