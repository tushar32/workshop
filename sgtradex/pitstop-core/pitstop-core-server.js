import express from 'express';
import cors from 'cors';
//import { EventSource } from 'undici';
import EventSource  from 'eventsource';

const app = express();
const port = 9000;
import * as dbConnect from './dbConnect.js'

app.use(express.urlencoded({ extended: true }));
app.use(express.json({
    limit: '50mb'
}));

app.use(cors())


// async function handler() {
//     //const evenSource = new EventSource('http://localhost:3000/config-event-without-db')
//     evenSource.onmessage = (event) => {
        
//         console.log('event data', event.data)        

//        // saveInDB(event.data)//pitstop core
//         //evenSource.close();

//     }
//     evenSource.onopen = (event) => {
//         console.log('open', event)
//     }

//     evenSource.onerror = (event) => {
//         console.log('error', event)
//     }
      
// }

// handler().then(() => {
//     console.log('handler')
// }).catch((err) => {
//     console.error(err)
// })
// const server = createServer((req, res) => {
//     handler().then((body) => {
//       res.writeHead(200, { 'Content-Type': 'text/plain' })
//       res.end(body)
//     }).catch((err) => {
//       console.error(err)
//       res.statusCode = 500
//       res.end(err.message)
//     })
//   })
//   handler()
//   server.listen(9000)

app.post('/web-hook/data-elements', async (req, res) => {

    const { row, command } = req.body
    const { elementname, elementschema, datatype } = row
    console.log('row', row)

    if(command === 'insert') {
        const result = await dbConnect.query(`INSERT INTO DataElement (ElementName, ElementSchema,DataType) 
        VALUES ($1, $2, $3) RETURNING id`, [elementname, elementschema, datatype])    
        const lastId = result.rows[0].id
        console.log(`Inserted new row: ${lastId}`)
    } else if(command === 'update') {
        const result = await dbConnect.query(`UPDATE DataElement SET ElementName = $1, ElementSchema = $2, DataType = $3 WHERE id = $4`, [elementname, elementschema, datatype, row.id])
        console.log(`Updated row: ${row.id}`)
    
    }

    res.json({ message: 'success' })    

})
const allocateHeavyObjects = () => {
    const numberOfObjects = 1000000;
    const objects = [];
    for (let i = 0; i < numberOfObjects; i++) {
      objects.push({ index: i, timestamp: Date.now(), random: Math.random() });
    }
    return objects;

  };
  
app.get('/heavy-process', async (req, res) => {
    const oj = allocateHeavyObjects();
    console.log('oj', oj.length)
    res.json({
        message: "finished heavy request",
      })
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });