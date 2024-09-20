import { alimaApiConfig } from "../config";
import { AlimaAPITokenError } from "../errors";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// consts
export const graphQLEndpoint = alimaApiConfig.host + "graphql";
export const maxGQLRetries = 3;

type GraphQLFetchProps = {
  query: string;
  headers?: any;
  variables?: any;
  files?: any;
  retries?: number;
};

/**
 * Call GraphQL endpoint via Fetch
 * @param  GraphQLFetchProps
 *  - query: string
 *  - headers?: any
 *  - variables?: any
 * @returns  {data: any, error: any}
 */
export const graphQLFetch = async ({
  query,
  headers = {},
  variables = {},
  retries = 0,
}: GraphQLFetchProps): Promise<{ data: any; error: any }>  => {
  // retries validation
  if (retries >= maxGQLRetries) {
    return {
      data: undefined,
      error: new AlimaAPITokenError("GQL: Max retries exceeded"),
    };
  }
  // headers
  const gqlHeaders = new Headers();
  gqlHeaders.append("Content-Type", "application/json");
  gqlHeaders.append("Accept", "application/json");
  if (headers) {
    Object.keys(headers).forEach((key) => {
      gqlHeaders.append(key, headers[key]);
    });
  }
  try {
    // response
    const resp = await fetch(graphQLEndpoint, {
      method: "POST",
      headers: gqlHeaders,
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });
    const data = await resp.json();
    // parse errors
    let err = undefined;
    if (data.errors) {
      err = data.errors.map((e: any) => e.message).join("\n");
    }
    if (Object.keys(data.data).includes("code")) {
      err = data.data.code;
    }
    // build response
    return {
      data: data.data,
      error: err,
    };
  } catch (error) {
    // connection error
    console.log(error);
    // fetch user token
    const currUser = firebase.auth().currentUser;
    const tokRes = await currUser?.getIdTokenResult(true);
    if (!tokRes) {
      return {
        data: undefined,
        error: new AlimaAPITokenError(error),
      };
    } else {
      return graphQLFetch({
        query: query,
        variables: variables,
        headers: {
          ...headers,
          Authorization: `supplybasic ${tokRes.token}`,
        },
        retries: retries + 1,
      });
    }
  }
};

/**
 * Call GraphQL endpoint via Fetch with files
 * @param GraphQLFetchProps
 *  - query: string
 *  - headers?: any
 *  - variables?: any
 *  - files?: any
 *     {files: {key: [file, filename]}, map: {key: 'variables.key'}}
 * @returns  {data: any, error: any}
 */
export const graphQLFetchFiles = async ({
  query,
  headers = {},
  variables = {},
  files = {},
}: GraphQLFetchProps) => {
  // headers
  const gqlHeaders = new Headers();
  if (headers) {
    Object.keys(headers).forEach((key) => {
      gqlHeaders.append(key, headers[key]);
    });
  }
  // form data
  const formdata = new FormData();
  formdata.append(
    "operations",
    JSON.stringify({
      query: query,
      variables: variables,
    })
  );
  formdata.append("map", JSON.stringify(files.map));
  Object.keys(files.files).forEach((key) => {
    const _blob = files.files[key][0];
    if (!_blob) return;
    formdata.append(key, _blob, files.files[key][1]);
  });
  // response
  try {
    const resp = await fetch(graphQLEndpoint, {
      method: "POST",
      headers: gqlHeaders,
      body: formdata,
    });
    const data = await resp.json();
    // parse errors
    let err = undefined;
    if (data.errors) {
      err = data.errors.map((e: any) => e.message).join("\n");
    }
    if (Object.keys(data.data).includes("code")) {
      err = data.data.code;
    }
    // build response
    return {
      data: data.data,
      error: err,
    };
  } catch (error) {
    // connection error
    console.log(error);
    return {
      data: undefined,
      error: new AlimaAPITokenError(error),
    };
  }
};
