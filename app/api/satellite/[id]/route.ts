import { NextRequest, NextResponse } from "next/server";
import { getSatellites, Satellite } from "@/src/lib/satelliteAPI";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const satellites: Satellite[] = await getSatellites();
  const satellite = satellites.find(
    (s) => s.id.trim().toUpperCase() === id.trim().toUpperCase()
  );

  if (!satellite) {
    return NextResponse.json(
      { error: `Satellite with id ${id} not found` },
      { status: 404 }
    );
  }

  // Retournez ici toutes les infos du satellite que vous souhaitez enrichir (comme TLE, image, etc.)
  return NextResponse.json(satellite);
}
