import morgan from "morgan";

const stream = {
  write: (message: string) => console.log(message.trim()),
};
export const morganMiddleware = morgan("dev", { stream });
