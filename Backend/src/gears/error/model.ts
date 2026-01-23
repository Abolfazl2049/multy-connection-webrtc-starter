class MyError extends Error {
  data: any;
  statusCode: number;
  constructor({message, data, statusCode}: {message: string; data: any; statusCode: number} = {message: "", data: null, statusCode: 500}) {
    super(message);
    this.data = data;
    this.statusCode = statusCode;
  }
}
export {MyError};
