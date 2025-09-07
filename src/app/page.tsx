import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/chat') // ⬅️ redirige a /chat
}
