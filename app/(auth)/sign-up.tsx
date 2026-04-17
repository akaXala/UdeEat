import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuth, useOAuth, useSignUp } from '@clerk/expo'
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

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
  const { signUp, fetchStatus } = useSignUp()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  
  const [pendingVerification, setPendingVerification] = useState(false)
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

  const handleOAuth = async (strategy: 'google' | 'apple') => {
    setIsLoading(true)
    try {
      let flow
      if (strategy === 'google') flow = startGoogleFlow;
      else flow = startAppleFlow;
      
      const { createdSessionId, setActive: oauthSetActive, signUp: oauthSignUp, signIn: oauthSignIn } = await flow({
        redirectUrl: oauthRedirectUrl,
      })

      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId })
        router.replace('/oauth-native-callback')
        return
      }

      const oauthStatus = oauthSignUp?.status ?? oauthSignIn?.status
      if (oauthStatus === 'missing_requirements') {
        const missingFields = oauthSignUp?.missingFields?.join(', ') || 'datos requeridos'
        Alert.alert('Faltan datos', `No se completó el registro con ${strategy}. Clerk requiere: ${missingFields}.`)
        return
      }

      Alert.alert('Aviso', 'No se pudo completar el registro social. Intenta nuevamente o usa correo.')
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, `No se pudo iniciar sesión con ${strategy}`))
    } finally {
      setIsLoading(false)
    }
  }

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return
    }

    if (!emailAddress || !password) {
      Alert.alert('Campos requeridos', 'Ingresa al menos correo y contraseña.')
      return
    }

    setIsLoading(true)
    try {
      const cleanFirstName = firstName.trim()
      const cleanLastName = lastName.trim()

      const createResult = await signUp.create({
        ...(cleanFirstName ? { firstName: cleanFirstName } : {}),
        ...(cleanLastName ? { lastName: cleanLastName } : {}),
        emailAddress,
      })
      if (createResult.error) {
        Alert.alert('Error', createResult.error.message)
        return
      }

      const passwordResult = await signUp.password({ password })
      if (passwordResult.error) {
        Alert.alert('Error', passwordResult.error.message)
        return
      }

      const sendCodeResult = await signUp.verifications.sendEmailCode()
      if (sendCodeResult.error) {
        Alert.alert('Error', sendCodeResult.error.message)
        return
      }
      setPendingVerification(true)
    } catch (err: any) {
      Alert.alert('Fallo en registro', getErrorMessage(err, 'No se pudo iniciar el registro.'))
    } finally { setIsLoading(false) }
  }

  const onPressVerify = async () => {
    if (!isLoaded) {
      return
    }

    setIsLoading(true)
    try {
      const verifyResult = await signUp.verifications.verifyEmailCode({ code })
      if (verifyResult.error) {
        Alert.alert('Error', verifyResult.error.message)
        return
      }

      if (signUp.status === 'complete') {
        const finalizeResult = await signUp.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) {
              Alert.alert('Acción requerida', 'Tu sesión requiere completar una tarea adicional en Clerk.')
            }
          },
        })

        if (finalizeResult.error) {
          Alert.alert('Error', finalizeResult.error.message)
          return
        }

        router.replace('/(tabs)')
      } else {
        Alert.alert('Faltan datos', `Clerk requiere: ${signUp.missingFields?.join(', ') || 'requisitos adicionales'}`)
      }
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err, 'No se pudo verificar el código.'))
    } finally { setIsLoading(false) }
  }

  if (pendingVerification) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Verifica tu correo</ThemedText>
        <TextInput style={styles.input} value={code} placeholder="Código" onChangeText={setCode} keyboardType="numeric" />
        <Pressable style={styles.button} onPress={onPressVerify} disabled={isBusy}>
          <ThemedText style={styles.buttonText}>{isBusy ? 'Verificando...' : 'Verificar'}</ThemedText>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={async () => {
            const resendResult = await signUp.verifications.sendEmailCode()
            if (resendResult.error) {
              Alert.alert('Error', resendResult.error.message)
            }
          }}
          disabled={isBusy}
        >
          <ThemedText style={styles.secondaryButtonText}>Enviar código otra vez</ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Crear Cuenta</ThemedText>

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

        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} value={firstName} placeholder="Nombre" onChangeText={setFirstName} />
          <TextInput style={[styles.input, { flex: 1 }]} value={lastName} placeholder="Apellido" onChangeText={setLastName} />
        </View>
        <TextInput style={styles.input} autoCapitalize="none" value={emailAddress} placeholder="Correo" onChangeText={setEmailAddress} keyboardType="email-address" />
        <TextInput style={styles.input} value={password} placeholder="Contraseña" secureTextEntry onChangeText={setPassword} />

        <Pressable style={styles.button} onPress={onSignUpPress} disabled={isBusy || !emailAddress || !password}>
          <ThemedText style={styles.buttonText}>{isBusy ? 'Cargando...' : 'Registrarse'}</ThemedText>
        </Pressable>

        <View style={styles.linkContainer}>
          <ThemedText>¿Ya tienes cuenta? </ThemedText>
          <Link href="/(auth)/sign-in"><ThemedText type="link">Inicia sesión</ThemedText></Link>
        </View>
      </ThemedView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  centeredContainer: { alignItems: 'center' },
  title: { marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
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