import React from 'react';
import { Redirect } from 'expo-router';

export default function NotificationClickRoute() {
  // When a user clicks a push notification, it triggers a deep link to huxeai://notification.click
  // This route intercepts that deep link and redirects the user to the main app interface.
  return <Redirect href="/(main)" />;
}
