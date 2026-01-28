import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  requestDidStart(): Promise<GraphQLRequestListener<any>> {
    console.log('Request started');
    return Promise.resolve({
      willSendResponse() {
        console.log('Will send response');
        return Promise.resolve();
      },
    });
  }
}
