import { clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'

const isAdminPortalRoute = createRouteMatcher(['/adminPortal(.*)'])
const isLoginRoute = createRouteMatcher(['/adminPortal/login'])

export default clerkMiddleware(async (auth, req) => {
  // 1. ISOLATED ADMIN PORTAL LOGIC
  if (isAdminPortalRoute(req)) {
    const adminSession = req.cookies.get('admin_session')

    // If they aren't logged in and aren't on the login page, kick them to login
    if (!adminSession && !isLoginRoute(req)) {
      return NextResponse.redirect(new URL('/adminPortal/login', req.url))
    }

    // If they ARE logged in but try to go to the login page, push them to dashboard
    if (adminSession && isLoginRoute(req)) {
      return NextResponse.redirect(new URL('/adminPortal', req.url))
    }

    // Bypass Clerk completely for admin routes
    return NextResponse.next()
  }

  // 2. NORMAL STOREFRONT LOGIC (Clerk)
  // Add any existing Clerk protections here if you had them
})


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};