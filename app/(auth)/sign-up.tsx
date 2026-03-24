import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSignUp } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native'

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [code, setCode] = React.useState('')

  const onSignUpPress = async () => {
    try {
        // 1. Iniciamos el registro con correo y contraseña
        const { error } = await signUp.password({
          emailAddress,
          password,
        })

        if (error) {
          console.error('Error en el registro:', JSON.stringify(error, null, 2))
          return
        }
        
        // 2. Solicitamos a Clerk que envíe el código de verificación por correo
        await signUp.verifications.sendEmailCode()
    } catch (err: any) {
        // Aquí es donde caen los errores de validación de Clerk (ej. contraseñas débiles)
        console.error('Excepción atrapada en el registro:', JSON.stringify(err, null, 2))
        
        // Intentamos extraer el mensaje exacto que nos envía Clerk para mostrarlo
        const errorMessage = err.errors?.[0]?.longMessage || err.message || 'Ocurrió un error al registrarse'
        Alert.alert('Error al crear cuenta', errorMessage)
    }


  }

  const onPressVerify = async () => {
    // 3. Enviamos el código que el usuario recibió
    await signUp.verifications.verifyEmailCode({
      code,
    })

    // 4. Si la cuenta fue verificada correctamente
    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: () => {
          router.replace('/')
        },
      })
    } else {
      console.error('No se pudo completar el registro:', signUp)
    }
  }

  // Si Clerk nos indica que el estatus requiere requisitos y falta verificar el correo electrónico
  const isPendingVerification = 
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0;

  if (isPendingVerification) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Verifica tu correo</ThemedText>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Código de verificación"
          placeholderTextColor="#666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        <Pressable 
          style={styles.button} 
          onPress={onPressVerify}
          disabled={fetchStatus === 'fetching'}
        >
          <ThemedText style={styles.buttonText}>
            {fetchStatus === 'fetching' ? 'Verificando...' : 'Verificar'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Crear Cuenta</ThemedText>

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Correo electrónico"
        placeholderTextColor="#666"
        onChangeText={(email) => setEmailAddress(email)}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Contraseña"
        placeholderTextColor="#666"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />

      <Pressable 
        style={styles.button} 
        onPress={onSignUpPress}
        disabled={fetchStatus === 'fetching' || !emailAddress || !password}
      >
        <ThemedText style={styles.buttonText}>
          {fetchStatus === 'fetching' ? 'Cargando...' : 'Registrarse'}
        </ThemedText>
      </Pressable>

      <View style={styles.linkContainer}>
        <ThemedText>¿Ya tienes una cuenta? </ThemedText>
        <Link href="/(auth)/sign-in">
          <ThemedText type="link">Inicia sesión</ThemedText>
        </Link>
      </View>

      <View nativeID="clerk-captcha" />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#0a7ea4', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  linkContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
})