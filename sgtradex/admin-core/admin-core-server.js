const express = require('express');
const ConfigCache = require('./database/models/ConfigCache');
const cors = require('cors');
const convert = require('xml-js')
const bodyParser = require('body-parser');
const resJsonMiddleWare = require('./middlewares/ResJsonMiddleWare');
const bodySchema = require('./bodySchema');
const dataElementXML = require('./dataElementXML');
const { insertProducer, updateProducer } = require('./logical-eplication/producer');
const setupPulisher = require('./logical-eplication/setup-publisher');
const subscriber = require('./logical-eplication/subscriber');
const pino = require('pino');
const { pinoHttp } = require('pino-http');


const app = express();
const port = 3000;

const transport = pino.transport({
  target: '@serdnam/pino-cloudwatch-transport',
  options: {
      logGroupName: 'pino-cloudwatch-test',
      logStreamName: 'pino-cloudwatch-test-stream',
      awsRegion: 'ap-southeast-1',
      interval: 1_000, // this is the default
  }
});

const logger = pino(transport);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors())
app.use(resJsonMiddleWare);



logger.info('Hello, CloudWatch Logs!')

// setupPulisher()

const sendData = async (req, res) => {
    try {
        const config = await ConfigCache.findOne().sort({ createdAt: 'desc' }); 
        res.json(config);


    } catch (error) {
        console.log(error)
    }
}

const SchemaConfig = []
let clients = [];

app.get('/config-event', sendData);

app.get('/config-event-without-db', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if(SchemaConfig.length > 0) {
        res.write(`data: ${JSON.stringify(SchemaConfig)}\n\n`);
    }

    
  const clientId = Date.now();

  const newClient = {
    id: clientId,
    res
  };

  clients.push(newClient);

    req.on('close', () => {
        res.end();
    });
});

function sendEventsToAll(config) {
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(config)}\n\n`))
}

app.get('/config-event-stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
 

  const handleChange = (change) => {
    console.log('change', change.operationType)
    if (change.operationType === 'insert') {
      //sendEvent(change.fullDocument);
      sendEvent(change.fullDocument);
    } else {
      sendData()
    }
  };

  const changeStream = ConfigCache.watch([], { fullDocument: 'updateLookup' });
  changeStream.on('change', handleChange);

  req.on('close', () => {
    changeStream.close();
    res.end();
  });
});


app.post('/convertXMLToJson', async (req, res) => {

  try {
    // console.log('body', req.body)
    const xmlJson = req.body;

    for (const key in xmlJson.properties) {
      const element = xmlJson.properties[key];
      const jsonData = convert.xml2js(element.description)

      if (jsonData
        && Array.isArray(jsonData.elements)
        && jsonData.elements.length
        && Array.isArray(jsonData.elements[0].elements)
        && jsonData.elements[0].elements.length) {
        let ref = [];
        jsonData.elements[0].elements.forEach((e) => {
          console.log('elements 2', e.elements[2]?.elements?.[0]?.text)
          ref.push({ name: e.elements[0]?.elements[0]?.text, value: e.elements[2]?.elements?.[0].text });
        });
      }
    }
  

     res.json({ message: "XML Converted to JSON", data: dataElementXML },bodySchema);
   
  } catch (error) {
    console.log(error)
    res.json({message: error.message});
  }

})

app.get('/convertXMLToJson', async (req, res) => {

  try {
    // console.log('body', req.body)
    const xmlJson = dataElementXML;

    for (const key in xmlJson.properties) {
      const element = xmlJson.properties[key];
      const jsonData = convert.xml2js(element.description)

      if (jsonData
        && Array.isArray(jsonData.elements)
        && jsonData.elements.length
        && Array.isArray(jsonData.elements[0].elements)
        && jsonData.elements[0].elements.length) {
        let ref = [];
        jsonData.elements[0].elements.forEach((e) => {
          console.log('elements 2', e.elements[2]?.elements?.[0]?.text)
          ref.push({ name: e.elements[0]?.elements[0]?.text, value: e.elements[2]?.elements?.[0].text });
        });
      }
    }
  

     res.json({ message: "XML Converted to JSON", data: xmlJson }, bodySchema);
   
  } catch (error) {
    console.log(error)
    res.json({message: error.message});
  }

})

app.post('/config', async (req, res) => {

    try {
        const config = req.body;
        console.log('body', req.body) 
        const newConfig = new ConfigCache({ config });
        await newConfig.save();
        SchemaConfig.push(config)

        res.json(newConfig);
        return sendEventsToAll(config)

    } catch (error) {
        console.log(error)
        res.json({message: error.message});
    }

})

app.put('/config/:id', async (req, res) => {

    try {      

        const config = req.body;

        const id = req.params.id;
        console.log('put request', id)

         await ConfigCache.findByIdAndUpdate(id, { config :config } )

        //await ConfigCache.updateOne({ id: id} , { config: config });

        SchemaConfig.push(config)
        res.json({message: 'Config Updated'});
        return sendEventsToAll(config)

    } catch (error) {
        console.log(error)
        res.json({message: error.message});
    }

})

app.post('/data-element/insert', async (req, res) => {
    try {
        const data = req.body;
        insertProducer(data)
        res.json({ message: "Data Inserted"});

    } catch (error) {
        console.log(error)
        res.json({message: error.message});
    }
})

app.put('/data-element/update', async (req, res) => {
  try {
      const data = req.body;
      console.log('body', req.body) 
      updateProducer(data)
      res.json({ message: "Data Inserted"});

  } catch (error) {
      console.log(error)
      res.json({message: error.message});
  }
})

app.post('/get-stream', async (req, res) => {
  try {
      const { limit } = req.body;
      console.log('req.body', req.body)
      //queryStream(limit)
      res.json({ message: "Data Inserted"});

  } catch (error) {
      console.log(error)
      res.json({message: error.message});
  }
})

// subscriber()

app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});


