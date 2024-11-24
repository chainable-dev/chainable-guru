const { Worker } = require('bullmq');
const Redis = require('ioredis');

// Redis connection
const redisConnection = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

// Create a worker to process the queue
const worker = new Worker('documentUploadQueue', async (job) => {
  const { documentId } = job.data;

  console.log(`Processing document ${documentId}...`);

  // Simulate document processing
  await processDocument(documentId);

  console.log(`Document ${documentId} processed successfully.`);
}, {
  connection: redisConnection,
});

// Document processing function
async function processDocument(documentId) {
  // Add your upload processing logic here
  console.log(`Simulating processing for document ${documentId}`);
}

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
