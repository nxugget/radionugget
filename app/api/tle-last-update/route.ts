import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the JSON file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'tle-last-update.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      return NextResponse.json({ 
        lastUpdate: data.updated_at || null
      });
    } else {
      return NextResponse.json(
        { lastUpdate: null, error: 'TLE update file not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error reading TLE update file:', error);
    return NextResponse.json(
      { lastUpdate: null, error: 'Failed to read TLE update information' },
      { status: 500 }
    );
  }
}
