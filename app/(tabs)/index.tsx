import { Image } from 'expo-image';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, TextInput } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  const isWeb = Platform.OS === 'web';
  const [expoPushToken, setExpoPushToken] = useState('');
  const [message, setMessage] = useState('Hello from Expo push');

  const registerForPushNotificationsAsync = async () => {
    if (isWeb) {
      Alert.alert('웹 제한', '푸시 권한/토큰 발급은 iOS/Android Expo Go에서 테스트하세요.');
      return;
    }
    const Notifications = await import('expo-notifications');

    if (!Device.isDevice) {
      Alert.alert('알림 안내', '실제 기기에서만 푸시 알림 테스트가 가능합니다.');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('권한 필요', '푸시 권한이 허용되지 않아 토큰을 발급할 수 없습니다.');
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      Alert.alert('설정 필요', 'EAS projectId를 찾지 못했습니다. app.json 설정을 확인해주세요.');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    setExpoPushToken(token);
    Alert.alert('토큰 발급 완료', '아래 토큰으로 푸시를 보낼 수 있습니다.');
  };

  const sendPushNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('토큰 필요', '먼저 "푸시 권한/토큰 받기"를 눌러 토큰을 발급하세요.');
      return;
    }

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title: '테스트 푸시',
        body: message || 'Hello from Expo push',
      }),
    });

    if (!res.ok) {
      Alert.alert('전송 실패', '푸시 전송 중 오류가 발생했습니다.');
      return;
    }

    Alert.alert('전송 완료', '푸시 전송 요청이 완료되었습니다.');
  };

  const sendLocalNotification = async () => {
    if (isWeb) {
      Alert.alert('웹 제한', '로컬 알림은 iOS/Android Expo Go에서 테스트하세요.');
      return;
    }
    const Notifications = await import('expo-notifications');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '로컬 알림 테스트',
        body: message || 'Hello from local notification',
        sound: 'default',
      },
      trigger: null,
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Push Notification Test</ThemedText>
        {isWeb ? (
          <ThemedText>웹에서는 푸시/로컬 알림 기능이 제한됩니다. Expo Go(iOS/Android)에서 테스트하세요.</ThemedText>
        ) : null}
        <Button title="푸시 권한/토큰 받기" onPress={registerForPushNotificationsAsync} />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="푸시 메시지 입력"
          style={styles.input}
        />
        <Button title="로컬 알림 테스트" onPress={sendLocalNotification} />
        <Button title="내 기기로 테스트 푸시 보내기" onPress={sendPushNotification} />
        <ThemedText type="defaultSemiBold">Expo Push Token</ThemedText>
        <ThemedText>{expoPushToken || '토큰이 아직 없습니다.'}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
