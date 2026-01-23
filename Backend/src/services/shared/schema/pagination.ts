import {checkSchema, Schema} from "express-validator";

const paginationSchemaOptions: Schema = {
  page: {
    in: "query",
    isNumeric: true,
    optional: {options: {nullable: true}}
  },
  pageSize: {
    in: "query",
    isNumeric: true,
    optional: {options: {nullable: true}}
  }
};
const paginationSchema = checkSchema(paginationSchemaOptions);

export {paginationSchema, paginationSchemaOptions};
