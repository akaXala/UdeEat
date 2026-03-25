import { useAuth } from '@clerk/expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
  const { isSignedIn, isLoaded, sessionId } = useAuth()
  const isAuthenticated = Boolean(sessionId) || Boolean(isSignedIn)

  if (!isLoaded) {
    return null
  }

  // Si el usuario ya inició sesión, lo enviamos al inicio
  if (isAuthenticated) {
    return <Redirect href={'/(tabs)'} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}