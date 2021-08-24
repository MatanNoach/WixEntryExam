const {
  Worker  
} = require("worker_threads");
const data = require('../data.json');
/**
 * The fucntion performs a superSearch by using 4 threads running a search concurrently,
 * and concatanating all of them when the result is resolved
 * @param {*} contents - The ticket's content
 * @param {*} word - The word to search by
 * @returns a promise of the result
 */
const superSearch = async (contents, word) => {
  // set the number of workers  
  const workerNum = 4;
  // get the ticket's size
  const ticketSize = contents.length;
  // calculate the cluster size
  const clusterSize = Math.floor(ticketSize / workerNum);
  // create an array of clusters
  const allClusters = [];
  for (let i = 0; i < workerNum; i++) {
    const cluster = contents.slice(i * clusterSize, (i + 1) * clusterSize);
    allClusters.push(cluster);
  }
  var i=1;
  // get an array of Promise - one from each worker
  const allResults = await Promise.all(
    allClusters.map( // for each cluster
      (cluster) =>
      // start a new worker
        new Promise((resolve, reject) => {
          // run doWork.js script, and send the cluster, word and worker number
          const worker = new Worker(require.resolve("./doWork"), {
            workerData: { cluster, word,i },
          });
          i++;
          worker.on("message", resolve);
          worker.on("error", reject);
          worker.on("exit", (code) => {
            if (code !== 0)
              reject(new Error(`Worker stopped with exit code ${code}`));
          });
        })
    )
  );
  // transfer the array from [][] to []
  return [].concat.apply([], allResults);
};

const contents = data.map((t)=>t.content);
superSearch(
  contents,
  "hello"
).then((res) => {
  console.log(res.length); // print the number of result when the function ends
});

