import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [error, setError] = useState('')

  async function signIn() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  return (
    <main className="shell login">
      <h1>PipeTask</h1>
      <p>Sign in to manage your pipeline.</p>
      <button type="button" onClick={signIn}>
        Continue with GitHub
      </button>
      {error && <p role="alert">{error}</p>}
    </main>
  )
}
