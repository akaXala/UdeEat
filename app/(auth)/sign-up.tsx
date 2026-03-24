import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useOAuth, useSignUp } from '@clerk/expo'
import * as Linking from 'expo-linking'
import { Link, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

export default function SignUpPage() {
  const { signUp } = useSignUp()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  
  const [pendingVerification, setPendingVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(false) 

  // 1. Añadimos Microsoft
  const { startOAuthFlow: startGoogleFlow } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: startAppleFlow } = useOAuth({ strategy: 'oauth_apple' })
  const { startOAuthFlow: startMicrosoftFlow } = useOAuth({ strategy: 'oauth_microsoft' })

  const handleOAuth = async (strategy: 'google' | 'apple' | 'microsoft') => {
    setIsLoading(true)
    try {
      let flow;
      if (strategy === 'google') flow = startGoogleFlow;
      else if (strategy === 'apple') flow = startAppleFlow;
      else flow = startMicrosoftFlow;
      
      const { createdSessionId, setActive, signUp: oauthSignUp } = await flow({
        redirectUrl: Linking.createURL('/', { scheme: 'udeeat' }),
      })

      // Si nos devuelve el session ID, todo salió perfecto
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId })
        router.replace('/')
      } else {
        // AQUÍ ESTABA EL PROBLEMA SILENCIOSO
        // Si no hay createdSessionId, la red social no envió todos los datos obligatorios
        console.log("Estado de registro OAuth:", oauthSignUp?.status);
        console.log("Campos faltantes:", oauthSignUp?.missingFields);

        if (oauthSignUp?.status === 'missing_requirements') {
          const faltantes = oauthSignUp?.missingFields?.join(', ') || 'datos obligatorios'
          Alert.alert(
            'Faltan datos de la red social', 
            `La cuenta no se creó porque ${strategy} no proporcionó: ${faltantes}. Por favor, haz que estos campos sean opcionales en Clerk o usa el registro por correo.`
          )
        } else {
          Alert.alert('Atención', 'El registro por red social quedó incompleto.')
        }
      }
    } catch (err: any) {
      console.error('OAuth error:', err)
      Alert.alert('Error', `No se pudo iniciar sesión con ${strategy}`)
    } finally {
      setIsLoading(false)
    }
  }

  // ... (Mantenemos onSignUpPress y onPressVerify exactamente igual que antes)
  const onSignUpPress = async () => {
    setIsLoading(true)
    try {
      const { error } = await signUp.password({ firstName, lastName, emailAddress, password })
      if (error) { Alert.alert('Error', error.message); return }
      await signUp.verifications.sendEmailCode()
      setPendingVerification(true)
    } catch (err: any) {
      Alert.alert('Fallo en registro', err.errors?.[0]?.longMessage || err.message)
    } finally { setIsLoading(false) }
  }

  const onPressVerify = async () => {
    setIsLoading(true)
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code })
      if (error) { Alert.alert('Error', error.message); return }
      if (signUp.status === 'complete') {
        await signUp.finalize({ navigate: () => router.replace('/') })
      } else {
        Alert.alert('Faltan datos', `Clerk requiere: ${signUp.missingFields?.join(', ')}`)
      }
    } catch (err: any) {
      Alert.alert('Error', err.message)
    } finally { setIsLoading(false) }
  }

  if (pendingVerification) {
    // ... (Mismo código de verificación)
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Verifica tu correo</ThemedText>
        <TextInput style={styles.input} value={code} placeholder="Código" onChangeText={setCode} keyboardType="numeric" />
        <Pressable style={styles.button} onPress={onPressVerify} disabled={isLoading}>
          <ThemedText style={styles.buttonText}>{isLoading ? 'Verificando...' : 'Verificar'}</ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Crear Cuenta</ThemedText>

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

        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} value={firstName} placeholder="Nombre" onChangeText={setFirstName} />
          <TextInput style={[styles.input, { flex: 1 }]} value={lastName} placeholder="Apellido" onChangeText={setLastName} />
        </View>
        <TextInput style={styles.input} autoCapitalize="none" value={emailAddress} placeholder="Correo" onChangeText={setEmailAddress} keyboardType="email-address" />
        <TextInput style={styles.input} value={password} placeholder="Contraseña" secureTextEntry onChangeText={setPassword} />

        <Pressable style={styles.button} onPress={onSignUpPress} disabled={isLoading || !emailAddress || !password || !firstName || !lastName}>
          <ThemedText style={styles.buttonText}>{isLoading ? 'Cargando...' : 'Registrarse'}</ThemedText>
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
  title: { marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
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