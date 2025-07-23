// const sleep_st = (t) => new Promise((r) => setTimeout(() => {
//     console.log(10)
//         r()
// }, t));
// const sleep_im = () => new Promise((r) => setImmediate(r));
// (async () => {
// setImmediate(() => console.log(1));
// console.log(2);
// await sleep_st(0);
// setImmediate(() => console.log(3));
// console.log(4);
// await sleep_im();
// setImmediate(() => console.log(5));
// console.log(6);
// await 1;
// setImmediate(() => console.log(7));
// console.log(8);
// })();
// new Promise(function (resolve) {
//     console.log('new promise')
//     resolve()
//   }).then(() => {
//     console.log('then 1')
//   })
  
//   async function foo () {
//     console.log('async function')
//   } 
  

//   setImmediate(() => {
//     console.log('immediate 1')
//   })
  
//   foo().then(() => {
//     console.log('then 2')
//   })

//   setTimeout(() => {
//     console.log('timeout 1')
//   })
  
//   process.nextTick(() => {
//     console.log('nextTick 1')
//   })
  
//   queueMicrotask(() => {
//     console.log('microtask 1')
//   })
  
//   setTimeout(() => {
//     console.log('timeout 2')
//   })
  
//   setImmediate(() => {
//     console.log('immediate 2')
//   })
  

// queueMicrotask(() => {
//     console.log('microtask 2')
//   })
  
//   process.nextTick(() => {
//     console.log('nextTick 2')
//   })
  
//   process.nextTick(() => {
//     console.log('nextTick 3')
//   })


  import fs from 'fs';

  setImmediate(() => console.log(1));
  Promise.resolve().then(() => console.log(2));
  process.nextTick(() => console.log(3));
  fs.readFile('C:\workshops\promise_all\README.md', () => {
      console.log(4);
      setTimeout(() => console.log(5));
      setImmediate(() => console.log(6));
      process.nextTick(() => console.log(7));
  });
  console.log('quick start');

 