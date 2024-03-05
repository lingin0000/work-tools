import { GraphQLInputType } from "graphql/type";
import { loopTree2String, TreeItem } from "../graphql-convert";

export const queryListTemplate = (
  name: string,
  fragments: {
    args: {
      name: string;
      value?: string | number;
      type?: GraphQLInputType;
    }[];
    fields: TreeItem[];
    name: string;
  }[]
) => {
  const start = "export const " + name + "Schema = gql`";
  const end = "`";
  let queryArgs = "";
  let queryFunArgs = "";

  fragments.forEach((fragment) => {
    fragment.args.forEach((arg) => {
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
  });

  const fieldsStr = fragments.map((fragment) => {
    return loopTree2String(fragment.fields);
  });
  const query = `query ${name}
    ${queryArgs ? `(${queryArgs})` : ""}
   {
    ${fragments
      .map((fragment, index) => {
        if (fragment.args.length === 0) {
          return `${fragment.name} {
            ${fieldsStr[index]}
          }`;
        }
        let queryFunArg = "";
        fragment.args.forEach((arg) => {
          if (arg.value) {
            const value = Number.isNaN(Number(arg.value))
              ? `"${arg.value}"`
              : arg.value;
            queryFunArg += `${arg.name}: ${value},`;
          } else {
            queryFunArg += `${arg.name}: $${arg.name},`;
          }
        });
        return `${fragment.name}(${queryFunArg}) {
          ${fieldsStr[index]}
        }`;
      })
      .join("\n")}
  }`;

  return {
    code: start + query + end,
    query,
  };
};
