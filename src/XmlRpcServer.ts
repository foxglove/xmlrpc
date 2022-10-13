import { Deserializer } from "./Deserializer";
import { HttpRequest, HttpResponse, HttpServer } from "./HttpTypes";
import { serializeFault, serializeMethodResponse, XmlRpcError } from "./Serializer";
import { XmlRpcFault } from "./XmlRpcFault";
import { XmlRpcMethodHandler, XmlRpcValue } from "./XmlRpcTypes";

// Create an XML-RPC server with a user-supplied HTTP(S) implementation
export class XmlRpcServer {
  readonly server: HttpServer;
  xmlRpcHandlers = new Map<string, XmlRpcMethodHandler>();

  constructor(server: HttpServer) {
    this.server = server;
    server.handler = this._requestHandler; // Our HTTP handler
  }

  url(): string | undefined {
    return this.server.url();
  }

  port(): number | undefined {
    return this.server.port();
  }

  async listen(port?: number, hostname?: string, backlog?: number): Promise<void> {
    return await this.server.listen(port, hostname, backlog);
  }

  close(): void {
    this.server.close();
  }

  setHandler(methodName: string, handler: XmlRpcMethodHandler): void {
    this.xmlRpcHandlers.set(methodName, handler);
  }

  private _requestHandler = async (req: HttpRequest): Promise<HttpResponse> => {
    let methodName: string;
    let args: XmlRpcValue[];
    try {
      const deserializer = new Deserializer();
      [methodName, args] = await deserializer.deserializeMethodCall(req.body);
    } catch (err) {
      return {
        statusCode: 500,
        statusMessage: `deserializeMethodCall failed: ${String(err)}`,
      };
    }

    let body: string;
    if (methodName === "system.multicall") {
      if (!Array.isArray(args) || args.length !== 1 || !Array.isArray(args[0])) {
        body = serializeFault(
          new XmlRpcFault("Invalid system.multicall", XmlRpcError.INVALID_PARAMS_ERROR),
        );
      } else {
        const calls = args[0] as {
          methodName: string;
          params: XmlRpcValue[];
        }[];
        const responses = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/promise-function-async
          calls.map((c) => this._methodCallHandler(c.methodName, c.params)),
        );
        const allResponses: XmlRpcValue[] = responses.map((res) => {
          if (res instanceof XmlRpcFault) {
            return {
              faultCode: res.faultCode ?? XmlRpcError.APPLICATION_ERROR,
              faultString: res.faultString ?? res.message,
            };
          } else {
            return [res];
          }
        });
        body = serializeMethodResponse(allResponses);
      }
    } else {
      const res = await this._methodCallHandler(methodName, args, req);
      body = res instanceof XmlRpcFault ? serializeFault(res) : serializeMethodResponse(res);
    }

    const contentLength = String(new TextEncoder().encode(body).length);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml", "Content-Length": contentLength },
      body,
    };
  };

  private _methodCallHandler = async (
    methodName: string,
    args: XmlRpcValue[],
    req?: HttpRequest,
  ): Promise<XmlRpcValue | XmlRpcFault> => {
    const handler = this.xmlRpcHandlers.get(methodName);
    if (handler == undefined) {
      return new XmlRpcFault(`Method "${methodName}" not found`, XmlRpcError.NOT_FOUND_ERROR);
    }

    try {
      const res = await handler(methodName, args, req);
      return res;
    } catch (err) {
      return err instanceof XmlRpcFault
        ? err
        : new XmlRpcFault(String((err as { stack?: string }).stack ?? err));
    }
  };
}
