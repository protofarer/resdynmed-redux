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
  useLoaderData,
} from "@remix-run/react";
import store from "store2";

import { getUser } from "~/session.server";
import stylesheet from "~/styles/global.css";

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
    initServerTime: getServerTime(),
    initLocalTime: null
  })
}

export async function clientLoader({ serverLoader }: ClientLoaderFunctionArgs) {
  const isInitialRequest = store.get('isInitialRequest') || true;

  if (isInitialRequest) {
    console.log(`INIT CACHE`, )
    store.set('isInitialRequest', false)

    const serverData = await serverLoader<ServerTimeResponse>()
    const { initLocalTime } = syncStores(serverData.initServerTime)

    return { initLocalTime, initServerTime: serverData.initServerTime }
  }

  const cachedInitServerTime = store.get('initServerTime')
  const cachedInitLocalTime = store.get('initLocalTime')

  if (cachedInitServerTime && cachedInitLocalTime) {
    console.log(`CACHE HIT`, )

    return { initLocalTime: cachedInitLocalTime, initServerTime: cachedInitServerTime }
  }

  console.log(`CACHE EMPTY WOOPS!`, )
  const serverData = await serverLoader<ServerTimeResponse>()
  const { initLocalTime } = syncStores(serverData.initServerTime)

  return { initLocalTime, initServerTime: serverData.initServerTime }
}

clientLoader.hydrate = true;

export default function App() {
  const { initLocalTime } = useLoaderData<typeof clientLoader>()

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-background text-foreground p-1 sm:p-2 lg:p-4">
        <TopBar displayTime={initLocalTime} />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
