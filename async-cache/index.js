import { createCache } from 'async-cache-dedupe'
import { promisify } from 'node:util'

const cache = createCache({
    ttl: 1, // seconds
    stale: 0, // number of seconds to return data after ttl has expired
    storage: { type: 'memory' },
  })
  
  const setTimeOut = promisify(setTimeout)
  cache.define('fetchSomething', async (k) => {
    
    console.log('query without cache', k)
    // query 42
    // query 24
  
    return { k }
  })
  
  const p1 = await cache.fetchSomething(42)
  const p2 = await cache.fetchSomething(24)
  await setTimeOut(800)
  const p3 = await cache.fetchSomething(42)
  const p4 = await cache.fetchSomething(42)

  // const pwc1 = fetchSomething(42)
  // const pwc2 = fetchSomething(24)
  // const pwc3 = fetchSomething(42)
  
 // const res1 = await Promise.all([p1, p2, p3])
  //const res2 = await Promise.all([pwc1, pwc2, pwc3])
  
  console.log(p1, p2,p3, p4)
  //console.log(res2)