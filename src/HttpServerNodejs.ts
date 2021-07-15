import http from "http";

import { HttpHandler, HttpServer } from "./HttpTypes";

export class HttpServerNodejs implements HttpServer {
  handler: HttpHandler;
  private _server: http.Server;

  constructor() {
    this.handler = () => Promise.resolve({ statusCode: 404 });
    this._server = new http.Server((req, res) => {
      // Read the full request body into a string
      const chunks: Uint8Array[] = [];
      req.on("data", (chunk: Uint8Array) => chunks.push(chunk));
      req.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        const input = { ...req, body };

        // Handle this request
        this.handler(input)
          .then((out) => {
            // Write the HTTP response
            res.shouldKeepAlive = out.shouldKeepAlive ?? res.shouldKeepAlive;
            res.writeHead(out.statusCode, out.statusMessage, out.headers);
            res.end(out.body);
          })
          .catch((err) => {
            // Write an HTTP error response
            res.writeHead(500, "Internal Server Error", { "Content-Type": "text/plain" });
            res.end(String(err));
          });
      });
    });
  }

  url(): string | undefined {
    const addr = this._server.address();
    if (addr == undefined || typeof addr === "string") {
      return addr ?? undefined;
    }
    const hostname = addr.address === "::" ? "[::]" : addr.address;
    return `http://${hostname}${addr.port != undefined ? ":" + String(addr.port) : ""}/`;
  }

  port(): number | undefined {
    const addr = this._server.address();
    if (addr == undefined || typeof addr === "string") {
      return undefined;
    }
    return addr.port;
  }

  listen(port?: number, hostname?: string, backlog?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this._server.on("error", reject);
      this._server.listen(port, hostname, backlog, () => {
        this._server.removeListener("error", reject);
        resolve();
      });
    });
  }

  close(): void {
    this._server.close();
  }
}
