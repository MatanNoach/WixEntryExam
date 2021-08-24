const {parentPort, workerData} = require('worker_threads');
// get the data for the work
const {cluster,word,i} = workerData;
// print the worker number
console.log("worker #",i)
// The filter function
const filterContents = (clusters)=>{
    return clusters.filter((c)=>(c.toLowerCase().includes(word.toLowerCase())))
}
// get the result of the filtered cluster
const result = filterContents(cluster)
// send the result to the main thread
parentPort.postMessage(result)