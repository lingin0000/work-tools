import { GraphQLInputType } from "graphql/type";
import { loopTree2String, TreeItem } from "../graphql-convert";

export const queryTemplate = (
  name: string,
  args: {
    name: string;
    value?: string | number;
    type?: GraphQLInputType;
  }[],
  fields: TreeItem[]
): {
  code: string;
  query: string;
} => {
  const start = "export const " + name + "Schema = gql`";
  const end = "`";
  let queryArgs = "";
  let queryFunArgs = "";
  args.forEach((arg) => {
    if (arg.value) {
      const value = Number.isNaN(Number(arg.value))
        ? `"${arg.value}"`
        : arg.value;
      queryFunArgs += `${arg.name}: ${value},`;
    } else {
      queryArgs += `$${arg.name}: ${arg.type},`;
      queryFunArgs += `${arg.name}: $${arg.name},`;
    }
  });
  if (fields.length === 0) {
    const query = `query ${name}
      ${queryArgs ? `(${queryArgs})` : ""}
     {
      ${name}${!!queryFunArgs.length ? `(${queryFunArgs})` : ""} 
  }`;
    return {
      code: start + query + end,
      query,
    };
  }

  const fieldsStr = loopTree2String(fields);

  const query = `query ${name}
    ${queryArgs ? `(${queryArgs})` : ""}
   {
    ${name}${!!queryFunArgs.length ? `(${queryFunArgs})` : ""} {${fieldsStr}}
  }`;
  return {
    code: start + query + end,
    query,
  };
};
