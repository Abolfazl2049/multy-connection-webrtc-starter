class SuccessResponse {
  message: string | null;
  data: any;
  constructor({message, data}: {message?: string; data?: any} = {message: "Operation successful", data: null}) {
    this.message = message ?? null;
    this.data = data;
  }
}
export {SuccessResponse};
