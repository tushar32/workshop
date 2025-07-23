import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { AsyncLocalStorage } from "async_hooks";
import { Agent } from "http";
import { createServer } from "http";

async function handler() {
    console.log('dswdeaswed')
  const asyncLocalStorage = new AsyncLocalStorage();

    // const dynamodbClient = DynamoDBDocumentClient.from(new DynamoDBClient({
    //     requestHandler: new NodeHttpHandler({
    //         httpAgent: new Agent({ keepAlive: true })
    //     }),
    //     region: "ap-southeast-1" 
    // }));

    // const params = {
    //     TableName: 'sgtradextech-pitstop-env-local',
    //     Key: {
    //     'hostname': 'demo50.pitstop.dev.sgtradex.io'
    //     }
    // };

    // try {
    //     const data = await dynamodbClient.send(new GetCommand(params));
    //     console.log(data.Item);
    // } catch (error) {
    //     console.error("Error fetching data from DynamoDB:", error);
    // }

    const a =123
    asyncLocalStorage.run(a, async () => {
        console.log('a', a)
        console.log('asyncLocalStorage', asyncLocalStorage.getStore())
         foo();
    })
    function foo() {
        console.log('foo', asyncLocalStorage.getStore());
    }
   

}



const server = createServer((req, res) => {
    handler().then((body) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      res.end(body)
    }).catch((err) => {
      console.error(err)
      res.statusCode = 500
      res.end(err.message)
    })
  })

  server.listen(3000)
  console.log('Server running at http://localhost:3000')