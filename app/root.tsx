import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  ClientLoaderFunctionArgs,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
} from "@remix-run/react";
import store from "store2";

import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";

import TopBar from "./components/TopBar";
import { getServerTime } from "./lib/time";
import { syncStores } from "./stores/sync";
import { ServerTimeResponse } from "./types";




export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
]

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ 
    user: await getUser(request),
    serverTime: getServerTime(),
    displayTime: null
  })
}

let isInitialRequest = true;

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {

  if (isInitialRequest) {
    console.log(`INITIALIZE CACHE!`, )
    isInitialRequest = false

    const serverData = await serverLoader<ServerTimeResponse>()
    const { displayTime, displayUTCTime } = syncStores(serverData.serverTime)

    return { displayTime, displayUTCTime }
  }

  const cachedServerTime = store.get('serverTime')
  const cachedDisplayTime = store.get('displayTime')

  if (cachedServerTime && cachedDisplayTime) {
    console.log(`CACHE HIT BABY!`, )

    return { displayTime: cachedDisplayTime, serverTime: new Date(cachedServerTime).toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      hour12: true, 
      minute: 'numeric', 
    }) }
  }

  console.log(`CACHE EMPTY WOOPS!`, )

  const serverData = await serverLoader<ServerTimeResponse>()
  const { displayTime, displayUTCTime } = syncStores(serverData.serverTime)

  return { displayTime, serverTime: displayUTCTime }
}

clientLoader.hydrate = true;

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <TopBar />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
