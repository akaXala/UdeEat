import { useAuth } from '@clerk/expo'
import { Redirect } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { View } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

export default function OAuthNativeCallbackScreen() {
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false })

  if (!isLoaded) {
    return <View style={{ flex: 1 }} />
  }

  return <Redirect href={isSignedIn ? '/(tabs)' : '/(auth)/sign-in'} />
}
