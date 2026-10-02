import Link from 'next/link'
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">404: Page not found</h1>
      <Link href="/" className="mt-4 text-primary underline">
        Go home
      </Link>
    </main>
  )
}
