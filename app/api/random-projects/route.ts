import { NextResponse } from "next/server";
import { getRandomProjects } from "@/src/lib/getRandomProjects";

export async function GET() {
  const projects = getRandomProjects();
  return NextResponse.json(projects);
}
