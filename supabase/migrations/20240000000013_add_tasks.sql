-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('chat', 'analysis', 'research')),
    priority INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    input TEXT NOT NULL,
    output TEXT,
    error TEXT,
    progress INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT progress_range CHECK (progress >= 0 AND progress <= 100)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON public.tasks(status);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS tasks_type_idx ON public.tasks(type);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id); 