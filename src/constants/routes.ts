import type {Route} from "next";

const ROUTES = {
  HOME: "/" as Route,
  STUDIO: (id: string) => `/studio/${id}` as Route,
  "SIGN-IN": "/sign-in" as Route,
  "SIGN-UP": "/sign-up" as Route,
};

export default ROUTES;
