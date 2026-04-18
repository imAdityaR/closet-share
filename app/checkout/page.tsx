import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserAddresses } from "@/lib/actions"
import { CheckoutClient } from "@/components/checkout-client"

export default async function CheckoutPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/") // Must be logged in to checkout
  }

  // Fetch the addresses we just built the backend for!
  const addresses = await getUserAddresses()

  return <CheckoutClient addresses={addresses} />
}