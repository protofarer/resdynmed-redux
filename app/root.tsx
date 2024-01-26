import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useEffect } from "react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";

import TopBar from "./components/TopBar";
import { getServerTime } from "./lib/time";
import { useTimeStore } from "./stores/timeStore";


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return typedjson({ 
    user: await getUser(request),
    serverTime: getServerTime()
  })
}

export default function App() {
	const { serverTime } = useTypedLoaderData<typeof loader>();
  const sync = useTimeStore((state) => state.sync)
  const displayTime = useTimeStore((state) => state.displayTime)

  useEffect(() => {
    sync(serverTime)
  })

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <TopBar displayTime={displayTime} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
