import {Request} from "express";
class Pagination {
  page: number = 1;
  limit: number = 10;
  constructor(req: Request) {
    this.page = req.query.page ? parseInt(req.query.page as string) : 1;
    this.limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  }
  setCount(count: number) {
    return {
      hasNext: this.page * this.limit < count,
      hasPrev: this.page > 1
    };
  }
}
export {Pagination};
