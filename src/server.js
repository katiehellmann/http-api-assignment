const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

/// a function that takes in the status, message, id, and content type
/// returns the appropriate XML or JSON response
// function to format responses as JSON or XML
const getResponse = (status, message, id = null, accept) => {
  if (accept === 'application/xml') {
    // xml response format
    let xmlResponse = `<response><message>${message}</message>`;
    if (id) xmlResponse += `<id>${id}</id>`;
    xmlResponse += '</response>';
    return xmlResponse;
  }
  // default to JSON response
  return JSON.stringify(id ? { message, id } : { message });
};
// make the server!
const server = http.createServer((req, res) => {
  // Determine XML or JSON response
  const { url, headers } = req;

  // figure out if the client wants JSON or XML
  const accept = headers.accept.includes('application/xml') ? 'application/xml' : 'application/json';

  console.log(accept); // Output: 'application/xml' or 'application/json'

  // Default response values
  let status = 200;
  let message = 'Success';
  let id = null;

  // serve the client-side HTML file
  if (url === '/') {
    fs.readFile(
      path.join(`${__dirname}/../client/client.html`),
      (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      },
    );
    return;
  }

  // serve the CSS file
  if (url === '/style.css') {
    fs.readFile(path.join(`${__dirname}/../client/style.css`), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      }
    });
    return;
  }

  switch (url) {
    case '/forbidden':
      status = 403;
      message = 'Forbidden Content';
      id = 'forbidden';
      break;
    case '/internal':
      status = 500;
      message = 'Internal Server Error';
      id = 'internal';
      break;
    case '/notImplemented':
      status = 501;
      message = 'This Feature Is Not Implemented';
      id = 'notImplemented';
      break;
    case '/badRequest?valid=true':
      status = 400;
      message = 'Valid param included, Successful Request';
      id = 'badRequest';
      break;
    case '/badRequest':
      status = 400;
      message = 'Missing valid param, Bad Request';
      id = 'badRequest';
      break;
    case '/unauthorized?loggedIn=yes':
      status = 401;
      message = 'Valid param included, Authorized';
      id = 'authorized';
      break;
    case '/unauthorized':
      status = 401;
      message = 'Missing valid param, Unauthorized';
      id = 'unauthorized';
      break;
    default:
      status = 404;
      message = 'Not Found';
      id = 'notFound';
      break;
  }

  // Return response to console
  const responseText = getResponse(status, message, id, accept);
  console.log(responseText);

  res.writeHead(status, { 'Content-Type': accept });
  res.end(responseText);
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
