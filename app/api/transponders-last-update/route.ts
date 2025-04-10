import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the JSON file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'transponders-last-update.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      return NextResponse.json({ 
        updated_at: data.updated_at || null
      });
    } else {
      return NextResponse.json(
        { updated_at: null, error: 'Transponders update file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error reading transponders update file:', error);
    return NextResponse.json(
      { updated_at: null, error: 'Failed to read transponders update information' },
      { status: 500 }
    );
  }
}
