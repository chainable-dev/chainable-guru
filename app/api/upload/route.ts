import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files')

    if (!files?.length) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadPromises = files.map(async (file: any) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        })

      if (error) throw error
      return data
    })

    const results = await Promise.all(uploadPromises)

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: results
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
} 