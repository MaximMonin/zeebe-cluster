const { ZBClient, Duration, ZBLogger } = require('zeebe-node');
const { router } = require ('./js/router.js');

const url = process.env.ZeebeUrl || 'gateway:26500';
const timeout = process.env.ResponseTimeout || 60000;
const loglevel = process.env.LogLevel || 'INFO';
const tasktype = process.env.TaskType || 'service-task';
const jobsToActivate = process.env.JobsToActivate || 32;

console.log('Zeebe Node worker is starting...')

const client = new ZBClient(url, {
//    loglevel: 'DEBUG',
    retry: true,
    maxRetries: -1, // infinite retries
    maxRetryTimeout: Duration.seconds.of(30),
    onReady: () => console.log(`Client connected to gateway`),
    onConnectionError: () => console.log(`Client disconnected from gateway`),
    connectionTolerance: 3000 // milliseconds
});

// For docker enviroment it catch docker compose down/restart commands
// The signals we want to handle
// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
var signals = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};
// Do any necessary shutdown logic for our application here
const shutdown = (signal, value) => {
  console.log(`Zeebe Node worker stopped`);
  process.exit(128 + value);
};
// Create a listener for each of the signals that we want to handle
Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    console.log(`Zeebe Node worker is shutdowning`);
    client.close().then(() => console.log('All workers closed'));

    shutdown(signal, signals[signal]);
  });
});


async function main() {
  try {
    const res = await client.topology()
    console.log(JSON.stringify(res, null, 2))
  } 
  catch (e) {
    console.error(e)
  }
  const zbWorker1 = client.createWorker({
//    debug: true,
    taskType: tasktype,
    taskHandler: async (task, complete, worker) => {
//      console.log (JSON.stringify(task)); 
      await router (task, complete);
    },
    failWorkflowOnException: false,
    maxJobsToActivate: jobsToActivate,
    longPoll: Duration.minutes.of(2),
    timeout: timeout,
    loglevel: loglevel,
    onReady: () => console.log('Worker connected to ' + tasktype),
    onConnectionError: () => console.log('Worker disconnected from ' + tasktype)
  });
};

main ();
