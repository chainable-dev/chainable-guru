const { Queue } = require('bullmq');
const Redis = require('ioredis');

// Redis connection
const redisConnection = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

// Create a queue
const uploadQueue = new Queue('documentUploadQueue', {
  connection: redisConnection,
});

// Add a document to the queue
async function addToQueue(documentId) {
  await uploadQueue.add('processDocument', { documentId }, {
    attempts: 3, // Retry up to 3 times if it fails
    backoff: { type: 'exponential', delay: 5000 }, // Retry with delay
  });
  console.log(`Document ${documentId} added to the queue.`);
}

module.exports = { addToQueue, uploadQueue };
