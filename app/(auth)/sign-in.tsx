import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth, useOAuth, useSignIn } from '@clerk/expo'
import { Link, Redirect, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { signIn } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' })
  const { startOAuthFlow: startMicrosoftFlow } = useOAuth({ strategy: 'oauth_microsoft' })

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />
  }

  const handleOAuth = async (strategy: 'google' | 'apple' | 'microsoft') => {
    if (isSignedIn) {
      router.replace('/(tabs)')
      return
    }

    setIsLoading(true)
    try {
      let flow;
      if (strategy === 'google') flow = startGoogleFlow;
      else if (strategy === 'apple') flow = startAppleFlow;
      else flow = startMicrosoftFlow;

      const { createdSessionId, setActive: oauthSetActive, signIn: oauthSignIn } = await flow()

      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId })
        router.replace('/(tabs)')
      } else {
        Alert.alert('Aviso', `No se completó el inicio de sesión. (Status: ${oauthSignIn?.status})`)
      }
    } catch (err: any) {
      const message = `${err?.errors?.[0]?.message || ''} ${err?.message || ''} ${String(err || '')}`.toLowerCase()
      if (message.includes('already signed in') || message.includes("you're already signed in")) {
        router.replace('/(tabs)')
        return
      }
      Alert.alert('Error', `No se pudo iniciar sesión con ${strategy}`)
    } finally {
      setIsLoading(false)
    }
  }

  const onSignInPress = async () => {
    if (!isLoaded) {
      return
    }

    setIsLoading(true)
    try {
      const createResult = await signIn.create({
        identifier: emailAddress,
      })
      if (createResult.error) {
        Alert.alert('Error', createResult.error.message)
        return
      }

      const passwordResult = await signIn.password({ password })
      if (passwordResult.error) {
        Alert.alert('Error', passwordResult.error.message)
        return
      }

      if (signIn.status === 'complete') {
        const finalizeResult = await signIn.finalize({
          navigate: () => router.replace('/(tabs)'),
        })

        if (finalizeResult.error) {
          Alert.alert('Error', finalizeResult.error.message)
        }
      } else {
        Alert.alert('Atención', 'Inicio de sesión incompleto.')
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.longMessage || 'Credenciales incorrectas')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>

        <View style={styles.socialContainer}>
          <Pressable style={[styles.socialButton, { backgroundColor: '#DB4437' }]} onPress={() => handleOAuth('google')} disabled={isLoading}>
            <ThemedText style={styles.socialButtonText}>Google</ThemedText>
          </Pressable>
          <Pressable style={[styles.socialButton, { backgroundColor: '#000' }]} onPress={() => handleOAuth('apple')} disabled={isLoading}>
            <ThemedText style={styles.socialButtonText}>Apple</ThemedText>
          </Pressable>
          <Pressable style={[styles.socialButton, { backgroundColor: '#0078D4' }]} onPress={() => handleOAuth('microsoft')} disabled={isLoading}>
            <ThemedText style={styles.socialButtonText}>Microsoft</ThemedText>
          </Pressable>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} /><ThemedText style={styles.dividerText}>o con tu correo</ThemedText><View style={styles.divider} />
        </View>

        <TextInput style={styles.input} autoCapitalize="none" value={emailAddress} placeholder="Correo electrónico" onChangeText={setEmailAddress} />
        <TextInput style={styles.input} value={password} placeholder="Contraseña" secureTextEntry onChangeText={setPassword} />

        <Pressable style={styles.button} onPress={onSignInPress} disabled={isLoading}>
          <ThemedText style={styles.buttonText}>{isLoading ? 'Cargando...' : 'Entrar'}</ThemedText>
        </Pressable>

        <View style={styles.linkContainer}>
          <ThemedText>¿No tienes cuenta? </ThemedText>
          <Link href="/(auth)/sign-up"><ThemedText type="link">Regístrate</ThemedText></Link>
        </View>
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#000' },
  button: { backgroundColor: '#0a7ea4', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  socialContainer: { flexDirection: 'row', gap: 10, marginBottom: 10, justifyContent: 'space-between' },
  socialButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', flex: 1 },
  socialButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#ccc' },
  dividerText: { marginHorizontal: 10, color: '#666' }
})