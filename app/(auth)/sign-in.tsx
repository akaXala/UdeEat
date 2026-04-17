import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth, useOAuth, useSignIn } from '@clerk/expo'
import * as AuthSession from 'expo-auth-session'
import { Link, Redirect, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

function getErrorMessage(error: any, fallback: string) {
  if (error?.message && typeof error.message === 'string') {
    return error.message
  }

  const clerkError = error?.errors?.[0]
  if (clerkError?.longMessage && typeof clerkError.longMessage === 'string') {
    return clerkError.longMessage
  }
  if (clerkError?.message && typeof clerkError.message === 'string') {
    return clerkError.message
  }

  return fallback
}

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' })
  const oauthRedirectUrl = AuthSession.makeRedirectUri({ path: 'oauth-native-callback' })

  const isBusy = isLoading || fetchStatus === 'fetching'

  if (!isLoaded) {
    return (
      <ThemedView style={[styles.container, styles.centeredContainer]}>
        <ThemedText>Cargando sesión...</ThemedText>
      </ThemedView>
    )
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />
  }

  const finalizeActiveSignIn = async () => {
    const finalizeResult = await signIn.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          Alert.alert('Acción requerida', 'Tu sesión requiere completar una tarea adicional en Clerk.')
        }
      },
    })

    if (finalizeResult.error) {
      Alert.alert('Error', finalizeResult.error.message)
      return false
    }

    return true
  }

  const maybeStartSecondFactor = async () => {
    if (signIn.status !== 'needs_second_factor' && signIn.status !== 'needs_client_trust') {
      return false
    }

    const sendCodeResult = await signIn.mfa.sendEmailCode()
    if (sendCodeResult.error) {
      Alert.alert('Error', sendCodeResult.error.message)
      return false
    }

    setPendingSecondFactor(true)
    return true
  }

  const handleOAuth = async (strategy: 'google' | 'apple') => {
    setIsLoading(true)
    try {
      let flow
      if (strategy === 'google') flow = startGoogleFlow;
      else flow = startAppleFlow;

      const { createdSessionId, setActive: oauthSetActive, signIn: oauthSignIn, signUp: oauthSignUp } = await flow({
        redirectUrl: oauthRedirectUrl,
      })

      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId })
        router.replace('/oauth-native-callback')
        return
      }

      const oauthStatus = oauthSignIn?.status ?? oauthSignUp?.status
      if (oauthStatus === 'needs_second_factor' || oauthStatus === 'needs_client_trust') {
        Alert.alert('Segundo factor requerido', 'Completa el inicio de sesión por correo y luego verifica tu código.')
        return
      }

      if (oauthStatus === 'missing_requirements') {
        Alert.alert('Registro incompleto', 'Faltan datos del proveedor social. Intenta con correo y contraseña.')
        return
      }

      Alert.alert('Aviso', 'No se pudo completar el inicio de sesión con el proveedor seleccionado.')
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, `No se pudo iniciar sesión con ${strategy}`))
    } finally {
      setIsLoading(false)
    }
  }

  const onSignInPress = async () => {
    if (!isLoaded) {
      return
    }

    if (!emailAddress || !password) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y tu contraseña.')
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
        const didFinalize = await finalizeActiveSignIn()
        if (didFinalize) {
          router.replace('/(tabs)')
        }
        return
      }

      const startedSecondFactor = await maybeStartSecondFactor()
      if (startedSecondFactor) {
        return
      }

      Alert.alert('Atención', 'Inicio de sesión incompleto. Revisa tus datos o intenta nuevamente.')
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'Credenciales incorrectas'))
    } finally {
      setIsLoading(false)
    }
  }

  const onVerifySecondFactor = async () => {
    if (!code) {
      Alert.alert('Código requerido', 'Ingresa el código enviado a tu correo.')
      return
    }

    setIsLoading(true)
    try {
      const verifyResult = await signIn.mfa.verifyEmailCode({ code })
      if (verifyResult.error) {
        Alert.alert('Error', verifyResult.error.message)
        return
      }

      if (signIn.status !== 'complete') {
        Alert.alert('Atención', 'El código fue recibido, pero la sesión aún no está completa.')
        return
      }

      const didFinalize = await finalizeActiveSignIn()
      if (!didFinalize) {
        return
      }

      setPendingSecondFactor(false)
      router.replace('/(tabs)')
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'No se pudo verificar el código.'))
    } finally {
      setIsLoading(false)
    }
  }

  const onResetSecondFactor = () => {
    signIn.reset()
    setPendingSecondFactor(false)
    setCode('')
  }

  if (pendingSecondFactor) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Verifica tu cuenta</ThemedText>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Código de verificación"
          keyboardType="numeric"
          onChangeText={setCode}
        />

        <Pressable style={styles.button} onPress={onVerifySecondFactor} disabled={isBusy}>
          <ThemedText style={styles.buttonText}>{isBusy ? 'Verificando...' : 'Verificar código'}</ThemedText>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={async () => {
          const resendResult = await signIn.mfa.sendEmailCode()
          if (resendResult.error) {
            Alert.alert('Error', resendResult.error.message)
          }
        }} disabled={isBusy}>
          <ThemedText style={styles.secondaryButtonText}>Enviar código otra vez</ThemedText>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onResetSecondFactor} disabled={isBusy}>
          <ThemedText style={styles.secondaryButtonText}>Empezar de nuevo</ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>

        <View style={styles.socialContainer}>
          <Pressable style={[styles.socialButton, { backgroundColor: '#DB4437' }]} onPress={() => handleOAuth('google')} disabled={isBusy}>
            <ThemedText style={styles.socialButtonText}>Google</ThemedText>
          </Pressable>
          <Pressable style={[styles.socialButton, { backgroundColor: '#000' }]} onPress={() => handleOAuth('apple')} disabled={isBusy}>
            <ThemedText style={styles.socialButtonText}>Apple</ThemedText>
          </Pressable>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} /><ThemedText style={styles.dividerText}>o con tu correo</ThemedText><View style={styles.divider} />
        </View>

        <TextInput style={styles.input} autoCapitalize="none" value={emailAddress} placeholder="Correo electrónico" onChangeText={setEmailAddress} />
        <TextInput style={styles.input} value={password} placeholder="Contraseña" secureTextEntry onChangeText={setPassword} />

        <Pressable style={styles.button} onPress={onSignInPress} disabled={isBusy}>
          <ThemedText style={styles.buttonText}>{isBusy ? 'Cargando...' : 'Entrar'}</ThemedText>
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
  centeredContainer: { alignItems: 'center' },
  title: { marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff', color: '#000' },
  button: { backgroundColor: '#0a7ea4', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  secondaryButton: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: '#0a7ea4', fontWeight: '600' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  socialContainer: { flexDirection: 'row', gap: 10, marginBottom: 10, justifyContent: 'space-between' },
  socialButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', flex: 1 },
  socialButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#ccc' },
  dividerText: { marginHorizontal: 10, color: '#666' }
})