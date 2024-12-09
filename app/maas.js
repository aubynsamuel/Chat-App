import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const MainLayout = () => {
  return (
    <Stack>
        <Stack.Screen name='main'/>
        <Stack.Screen name='auth'/>
    </Stack>
  )
}

export default MainLayout