import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useSignIn } from '@clerk/expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet, TextInput, View } from 'react-native'

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onSignInPress = async () => {
    const { error } = await signIn.password({
      emailAddress,
      password,
    })

    if (error) {
      console.error('Error al iniciar sesión:', JSON.stringify(error, null, 2))
      return
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: () => {
          router.replace('/')
        },
      })
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Correo electrónico"
        placeholderTextColor="#666"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
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
        onPress={onSignInPress} 
        disabled={fetchStatus === 'fetching'}
      >
        <ThemedText style={styles.buttonText}>
          {fetchStatus === 'fetching' ? 'Cargando...' : 'Entrar'}
        </ThemedText>
      </Pressable>

      <View style={styles.linkContainer}>
        <ThemedText>¿No tienes cuenta? </ThemedText>
        <Link href="/(auth)/sign-up">
          <ThemedText type="link">Regístrate</ThemedText>
        </Link>
      </View>
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