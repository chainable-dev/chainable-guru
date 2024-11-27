import { NextRequest, NextResponse } from "next/server";
import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const TEMP_DIR = path.join(process.cwd(), 'tmp');

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    
    // Generate a unique filename
    const filename = path.join(TEMP_DIR, `${uuidv4()}.py`);
    
    // Write the code to a temporary file
    await writeFile(filename, code);
    
    // Execute the Python code
    const output = await new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      
      const process = spawn('python3', [filename], {
        timeout: 10000, // 10 second timeout
      });
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || 'Execution failed'));
        }
      });
      
      process.on('error', (err) => {
        reject(err);
      });
    });
    
    return NextResponse.json({ output });
  } catch (error) {
    console.error('Python execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute Python code' },
      { status: 500 }
    );
  }
} 