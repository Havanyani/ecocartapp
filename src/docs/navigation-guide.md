# EcoCart Navigation Guide

## Navigation Structure

The EcoCart application uses React Navigation for structured and type-safe navigation. Our navigation structure is organized hierarchically:

### Root Navigator (`RootNavigator.tsx`)

The top-level navigator that manages:
- Authentication state (redirecting to Auth or Main flows)
- Deep linking configuration
- Theme integration with the navigation container

```typescript
<NavigationContainer linking={linking}>
  <Stack.Navigator>
    {isAuthenticated ? (
      <Stack.Screen name="Main" component={MainNavigator} />
    ) : (
      <Stack.Screen name="Auth" component={AuthNavigator} />
    )}
  </Stack.Navigator>
</NavigationContainer>
```

### Authentication Navigator (`AuthNavigator.tsx`)

Contains all authentication-related screens:
- Login
- Signup
- ForgotPassword

### Main Navigator (`MainNavigator.tsx`)

The main authenticated experience, containing:
- Bottom tab navigation
- Stack navigators for each tab section
- Modal screens

```typescript
<Stack.Navigator>
  <Stack.Screen name="MainTabs" component={MainTabNavigator} />
  <Stack.Screen name="MaterialDetail" component={MaterialDetailScreen} />
  {/* ...other screens */}
</Stack.Navigator>
```

### Smart Home Navigator (`SmartHomeNavigator.tsx`)

A nested navigator containing all smart home related screens:
- Device discovery
- Device controls
- Energy usage
- Automation rules

## Deep Linking

EcoCart supports deep linking through the `linking.ts` configuration. This enables:
- Universal links (iOS)
- Deep links (Android)
- Web URLs (when deployed as a web app)

### Deep Link Structure

```
// Authentication
ecocart://auth/login
ecocart://auth/signup
ecocart://auth/forgot-password

// Main tabs
ecocart://tabs/home
ecocart://tabs/recycle
ecocart://tabs/smart-home
ecocart://tabs/profile

// Smart home
ecocart://smart-home/device/[deviceId]
ecocart://smart-home/energy/[deviceId]
ecocart://smart-home/automation

// Others
ecocart://material/[materialId]
ecocart://scan
ecocart://collection/[collectionId]
```

### Testing Deep Links

For development testing:

**Android:**
```
adb shell am start -W -a android.intent.action.VIEW -d "ecocart://material/123" com.ecocart.app
```

**iOS Simulator:**
```
xcrun simctl openurl booted "ecocart://material/123"
```

## Navigation Patterns

### Recommended Practices

1. **Type Safety**:
   - Use the defined types for navigation props
   - Example: `type MaterialDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'MaterialDetail'>;`

2. **Screen Navigation**:
   ```typescript
   import { useNavigation } from '@react-navigation/native';
   
   // In your component
   const navigation = useNavigation();
   navigation.navigate('MaterialDetail', { materialId: '123' });
   ```

3. **Using Route Parameters**:
   ```typescript
   import { useRoute } from '@react-navigation/native';
   
   // In your component
   const route = useRoute<MaterialDetailScreenProps['route']>();
   const { materialId } = route.params;
   ```

### Common Patterns

1. **Passing Data Between Screens:**
   - Use route parameters for small data
   - Use global state (Context/Redux) for larger data

2. **Modal Presentations:**
   ```typescript
   <Stack.Screen 
     name="ARContainerScan" 
     component={ARContainerScanScreen}
     options={{ 
       presentation: 'modal', 
       animation: 'slide_from_bottom' 
     }}
   />
   ```

3. **Header Customization:**
   ```typescript
   <Stack.Screen
     name="DeviceDetails"
     component={DeviceDetailsScreen}
     options={({ route }) => ({
       title: route.params.deviceName || 'Device Details',
       headerRight: () => (
         <TouchableOpacity onPress={/* action */}>
           <Ionicons name="settings-outline" size={24} />
         </TouchableOpacity>
       ),
     })}
   />
   ```

## Advanced Navigation Features

### Notifications Handling

When receiving a push notification, you can navigate to the appropriate screen:

```typescript
// In your notification handler
function handleNotification(notification) {
  const { data } = notification;
  
  if (data.type === 'material') {
    navigation.navigate('MaterialDetail', { materialId: data.id });
  } else if (data.type === 'collection') {
    navigation.navigate('CollectionDetail', { collectionId: data.id });
  }
}
```

### OAuth Callback Handling

For OAuth integration with smart home platforms:

```typescript
// In your deep link handler
if (url.includes('oauth/google/callback')) {
  const code = extractCodeFromURL(url);
  smartHomeService.handleGoogleOAuthCallback(code);
} 