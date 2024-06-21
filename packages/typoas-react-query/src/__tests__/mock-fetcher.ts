import { BaseFetcherData, Fetcher, ResponseContext } from '@typoas/runtime';

export class MockFetcher implements Fetcher<BaseFetcherData> {
  private data: unknown = undefined;

  private resQueue: unknown[] = [];

  mockResponse<T>(data: T): void {
    this.data = data;
  }

  mockResponseOnce<T>(data: T): MockFetcher {
    this.resQueue.push(data);
    return this;
  }

  async send(): Promise<ResponseContext> {
    let data = this.resQueue.pop();
    if (!data) {
      data = this.data;
    }

    return new ResponseContext(
      200,
      { 'content-type': 'application/json' },
      {
        binary: async () => new Blob([]),
        text: async () => '',
        json: async () => data,
      },
    );
  }
}
