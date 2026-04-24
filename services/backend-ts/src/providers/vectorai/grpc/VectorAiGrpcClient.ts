import * as grpc from "@grpc/grpc-js";
import { env } from "../../../config/env";

export class VectorAiGrpcClient {
  private readonly address: string;
  private readonly credentials: grpc.ChannelCredentials;

  constructor() {
    this.address = `${env.VECTORAI_HOST}:${env.VECTORAI_PORT}`;
    this.credentials = grpc.credentials.createInsecure();
  }

  getAddress(): string {
    return this.address;
  }

  createClient<T extends grpc.Client>(
    ClientCtor: new (
      address: string,
      credentials: grpc.ChannelCredentials,
      options?: object
    ) => T,
    options?: object
  ): T {
    return new ClientCtor(this.address, this.credentials, options);
  }
}