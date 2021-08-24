/**
 * In order to perform a superSearch on a data in a large scale, I decided to implement the regular search in concurrent pattern.
 * The script opens threads (by the number of cpu's on the pc), split the whole data among them, and perform the search for each one.
 * Once all threads finishes the search, the are concatenated to a single array, and returned from the function.
 * 
 * NOTE - The script might be slower then the regular search on small amount of tickets (becuase the overhead of opening the threads),
 * but on larger scale, it should work much faster
 * 
 */

const {
  Worker  
} = require("worker_threads");
const data = require('../data.json');
const os = require('os')

/**
 * The fucntion performs a superSearch by using 4 threads running a search concurrently,
 * and concatanating all of them when the result is resolved
 * @param {*} contents - The ticket's content - just to represent the idea of the search
 * @param {*} word - The word to search by
 * @returns a promise of the result
 */
const superSearch = async (contents, word) => {
  console.log("performing superSearch on the word: ",word)
  // set the number of by the numbers of CPU's on the pc
  const workerNum = os.cpus().length;
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


if(process.argv.length==3){
  const contents = data.map((t)=>t.content);
  superSearch(
    contents,
    process.argv[2]
  ).then((res) => {
    console.log(res.length + " results found!"); // print the number of result when the function ends
  });
  }else{
    console.log("Wrong number of arguments.")
  }

