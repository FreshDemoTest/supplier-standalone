export class AlimaSupplierError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'AlimaSupplierError';
  }
}

export class AlimaAPITokenError extends Error {
  constructor(message: any) {
    super(message);
    this.name = 'AlimaAPITokenError';
  }
}

export class GQLError extends Error {
  reason: string;

  constructor(message: any, reason: string = '') {
    super(message);
    this.name = 'GQLError';
    this.reason = reason;
  }
}

export const GQLErrorTypes = {
  INSERT_SQL_DB_ERROR: 1001, // Error inserting data record in SQL DB
  DELETE_SQL_DB_ERROR: 1002, // Error deleting record in SQL DB
  UPDATE_SQL_DB_ERROR: 1003, // Error updating record in SQL DB
  FETCH_SQL_DB_ERROR: 1004, // Error fetch record in SQL DB
  FETCH_SQL_DB_NOT_FOUND: 1005, // Fetched record not found
  FETCH_SQL_DB_EMPTY_RECORD: 1006, // Fetched empty record
  FETCH_SQL_DB_EXISTING_RECORD: 1007, // Fetched existing record
  EXECUTE_SQL_DB_ERROR: 1008, // Error executing SQL DB
  CONNECTION_SQL_DB_ERROR: 1010, // Error to connect SQL DB
  INVALID_SQL_DB_OPERATION: 1011, // Invalid SQL DB operation
  // Data Validation
  DATAVAL_WRONG_DATATYPE: 2001, // Sent Argument does not correspond to correct data type
  DATAVAL_NO_DATA: 2002, // Sent Empty arguments
  DATAVAL_DUPLICATED: 2003, // Sent duplicated arguments
  // mongoDB
  INSERT_MONGO_DB_ERROR: 3001, // Error inserting data record in Mongo DB
  DELETE_MONGO_DB_ERROR: 3002, // Error deleting record in Mongo DB
  UPDATE_MONGO_DB_ERROR: 3003, // Error updating record in Mongo DB
  FETCH_MONGO_DB_ERROR: 3004, // Error fetch record in Mongo DB
  FETCH_MONGO_DB_EMPTY_RECORD: 3005, // Fetched empty record
  RECORD_ALREADY_EXIST: 2006, // Error record already exist
  CONNECTION_MONGO_DB_ERROR: 2010, // Error to connect mongo DB
  // xlsx
  WRONG_COLS_FORMAT: 4001, // Error in columns format
  EMPTY_DATA: 4002, // Error empty data
  WRONG_DATA_FORMAT: 4003, // Error in data format
  // xml and pdf
  WRONG_XML_FORMAT: 5001, // Error in xml format
  // Firebase
  INSERT_FIREBASE_DB_ERROR: 6001, // Error inserting data record in Firebase Service
  // GENERIC
  UNEXPECTED_ERROR: 9999, // Unexpected error
  // Facturama
  FACTURAMA_NO_VALID_DATA: 7001
};

const decGQLErrorType = Object.entries(GQLErrorTypes).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as { [key: number]: string }
);

export const decodeGQLErrorType = (code: number) => {
  return decGQLErrorType[code] || 'UNEXPECTED_ERROR';
};
