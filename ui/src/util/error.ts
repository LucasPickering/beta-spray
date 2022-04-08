export class HTTPError extends Error {
  constructor(public readonly response: Response) {
    super(`HTTP error ${response.status}`);
  }
}
