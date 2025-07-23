import QueryStream from 'pg-query-stream'
import fs, { createReadStream, read } from 'fs'
import { pipeline } from 'node:stream/promises'
import pg from 'pg'
import {Transform } from 'stream'
import { sendToHighway } from './sendHighway.js'
import { createGzip } from 'zlib'


var pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    database: 'pitstop_core_demo',
    user: 'postgres',
    password: 'postgres',
})
const writable = fs.createWriteStream("C:/Users/TusharSudhakarBarate/Downloads/metering-data.csv.gz");

const transformStream = new Transform({
    objectMode: true,
    transform(row, encoding, callback) {
      row.date = new Date().toString();
      callback(null, `${row.row_number}, ${row.id}, ${row.name}, ${row.date}` + "\n");
    },
  });

async function queryStream (limit) {
  // Get the PostgreSQL client from the pool
  const client = await pool.connect()

  // The slow query we want to run
  const slowQuery = `
    WITH start_time AS (SELECT pg_sleep(1) AS start_time)
    SELECT items.id, desks.name, row_number() OVER (ORDER BY items.id) AS row_number
    FROM items
    INNER JOIN desks ON desks.id = items.desk_id
    CROSS JOIN start_time

    LIMIT $1;
  `

  // Create a new stream that runs the query
  const query = new QueryStream(slowQuery, [limit], {
    highWaterMark: 1000
  })

  // Run the query and return the stream
  const stream = client.query(query)
  
  //console.log('Query running',stream)
   // Add error listeners to the streams
  //  stream.on('error', (err) => {
  //       console.error('Stream error', err);
  //       client.release();
  //   });

  stream.on('end', () => { client.release() })


   
  //stream.pipe(transformStream).pipe(writable)


  // const myStream = stream.pipe(JSONStream.stringify()) // return the data to FE using JSONStream

 // await sendToHighway(myStream)
 
  // await sendToHighway(chunk);

  
  // Here we are writing a data to file
  try {
    await pipeline(
      stream,
      transformStream,
      createGzip(),
      writable
    );
    console.log('Pipeline succeeded');
  } catch (err) {
    console.error('Pipeline failed', err);
  }

  // return stream.pipe(JSONStream.stringify()).pipe(writable)
}


queryStream(300000)

