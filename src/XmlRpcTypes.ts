import { XmlRpcFault } from "./XmlRpcFault";

export type XmlRpcValue =
  | undefined
  | boolean
  | number
  | string
  | Date
  | Uint8Array
  | XmlRpcValue[]
  | XmlRpcStruct;

export type XmlRpcStruct = { [key: string]: XmlRpcValue };

export type Encoding =
  | "ascii"
  | "utf8"
  | "utf-8"
  | "utf16le"
  | "ucs2"
  | "ucs-2"
  | "base64"
  | "latin1"
  | "binary"
  | "hex";

export type XmlRpcMethodHandler = (
  methodName: string,
  args: XmlRpcValue[]
) => Promise<XmlRpcValue>;

export type XmlRpcValueOrFault = XmlRpcValue | XmlRpcFault;