import { createServer } from 'http'
import { parse } from 'url'
import { StringDecoder } from 'string_decoder'
import { config } from './config'

// general handler for both http and https server
const serverHandler = (request, response) => {
    const parsedUrl = parse(request.url, true)
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '') // remove slashes at start and end
    const method = request.method.toUpperCase()
    const queryString = parsedUrl.query
    const headers = request.headers

    // decoder for catching request data
    const decoder = new StringDecoder('utf-8')
    let buffer = ''

    request.on('data', (data) => {
        buffer += decoder.write(data)
    })

    request.on('end', () => {
        buffer += decoder.end()

        // find request handler that can handle the path and method
        const methodHandler = router.hasOwnProperty(method) ? router[method] : null
        const requestHandler = methodHandler && methodHandler.hasOwnProperty(path) ? methodHandler[path] : requestHandlers.notFound
        // create data container with normalized request information
        const data = { path, method, headers, queryString, body: buffer }

        // call the found handler and define callback function
        requestHandler(data, (status = 200, responseData = {}) => {
            const responseBody = JSON.stringify(responseData)

            // send response to client
            response.setHeader('Content-Type', 'application/json')
            response.writeHead(status)
            response.end(responseBody)

            console.log(`Response ${status} ${responseBody}`)
        })

        console.log(`Request ${method} ${path} with`, queryString)
        console.log(`Payload: ${buffer}`)
    })
}

const requestHandlers = {
    hello: (data, callback) => {
        callback(200, { message: `Hello, you posted ${data.body}` })
    },

    notFound: (data, callback) => {
        callback(404, 'Not Found')
    },
}

const router = {
    POST: {
        hello: requestHandlers.hello
    }
}

const port = config.port || 3000

const httpServer = createServer(serverHandler)
httpServer.listen(port, () => console.log(`Listening on port ${port}`))
