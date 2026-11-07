import React from 'react';
import { StyleSheet, View } from 'react-native';
import RootNavigator from '@/navigation/RootNavigator';

export default function Index() {
  return (
    <View style={styles.main}>
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'white',
  },
});
