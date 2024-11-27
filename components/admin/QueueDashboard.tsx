import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

type JobState = 'active' | 'waiting' | 'completed' | 'failed' | 'delayed';

interface Job {
  id: string;
  type: string;
  userId: string;
  state: JobState;
  progress: number;
  createdAt: string;
  result?: any;
  error?: any;
}

export function QueueDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<JobState>('active');

  // Fetch jobs periodically
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/admin/queues');
        const data = await res.json();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter jobs by state
  const filteredJobs = jobs.filter(job => job.state === activeTab);

  // Cancel a job
  const cancelJob = async (jobId: string) => {
    try {
      await fetch(`/api/admin/queues/${jobId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  // Retry a failed job
  const retryJob = async (jobId: string) => {
    try {
      await fetch(`/api/admin/queues/${jobId}/retry`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error retrying job:', error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Job List */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as JobState)}>
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="waiting">Waiting</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{job.type}</span>
                      <Badge>{job.state}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {job.id} • Created {formatDistanceToNow(new Date(job.createdAt))} ago
                    </div>
                    {job.progress > 0 && (
                      <Progress value={job.progress} className="w-[200px]" />
                    )}
                  </div>
                  <div className="flex gap-2">
                    {job.state === 'active' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelJob(job.id);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    {job.state === 'failed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryJob(job.id);
                        }}
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedJob ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">ID</div>
                <div className="text-sm text-muted-foreground">{selectedJob.id}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Type</div>
                <div className="text-sm text-muted-foreground">{selectedJob.type}</div>
              </div>
              <div>
                <div className="text-sm font-medium">User ID</div>
                <div className="text-sm text-muted-foreground">{selectedJob.userId}</div>
              </div>
              <div>
                <div className="text-sm font-medium">State</div>
                <Badge>{selectedJob.state}</Badge>
              </div>
              <div>
                <div className="text-sm font-medium">Progress</div>
                <Progress value={selectedJob.progress} />
              </div>
              <div>
                <div className="text-sm font-medium">Created At</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(selectedJob.createdAt).toLocaleString()}
                </div>
              </div>
              {selectedJob.result && (
                <div>
                  <div className="text-sm font-medium">Result</div>
                  <pre className="text-sm bg-muted p-2 rounded-md">
                    {JSON.stringify(selectedJob.result, null, 2)}
                  </pre>
                </div>
              )}
              {selectedJob.error && (
                <div>
                  <div className="text-sm font-medium">Error</div>
                  <pre className="text-sm bg-destructive/10 text-destructive p-2 rounded-md">
                    {JSON.stringify(selectedJob.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              Select a job to view details
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 