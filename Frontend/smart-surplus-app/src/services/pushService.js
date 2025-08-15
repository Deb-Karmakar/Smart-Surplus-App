import api from './api';

const VAPID_PUBLIC_KEY = 'BASEQ-R4nugGtdpnnwkCXjGtIv-8Ls0TJUtBCJtwYxw3iPZhXqogX3y1tFRRKqcj22tThVtOlV-_Ys9blLYYpi8';

function urlBase64ToUint8Array(base64String) {
  try {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('❌ Error in urlBase64ToUint8Array:', error);
    throw error;
  }
}

// Add this function to your pushService.js file
export const clearPushSubscription = async () => {
  try {
    console.log('🧹 Clearing all push subscriptions...');
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('🗑️ Found existing subscription, unsubscribing...');
        await subscription.unsubscribe();
        console.log('✅ Successfully unsubscribed');
      } else {
        console.log('ℹ️ No existing subscription found');
      }
    }
  } catch (error) {
    console.error('❌ Error clearing subscription:', error);
  }
};

export const subscribeUser = async () => {
  console.log('🔄 subscribeUser function called');
  
  try {
    // Check browser support
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }
    if (!('PushManager' in window)) {
      throw new Error('Push Manager not supported');
    }
    
    console.log('✅ Browser supports Service Worker and Push Manager');

    // Register service worker first
    console.log('🔄 Registering service worker...');
    let registration;
    try {
      registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('✅ Service Worker registered:', registration);
      
      // Wait for it to be ready with a timeout
      console.log('🔄 Waiting for service worker to be ready...');
      const readyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Service Worker ready timeout')), 10000);
      });
      
      registration = await Promise.race([readyPromise, timeoutPromise]);
      console.log('✅ Service Worker is ready:', registration);
      
    } catch (swError) {
      console.error('❌ Service Worker registration failed:', swError);
      throw new Error(`Service Worker registration failed: ${swError.message}`);
    }

    // Request notification permission
    console.log('🔔 Requesting notification permission...');
    const permission = await window.Notification.requestPermission();
    console.log('🔔 Notification permission result:', permission);
    
    if (permission !== 'granted') {
      throw new Error(`Notification permission denied: ${permission}`);
    }

    // Check for existing subscription
    console.log('🔄 Checking for existing subscription...');
    const existingSubscription = await registration.pushManager.getSubscription();
    
    if (existingSubscription) {
      console.log('ℹ️ Found existing subscription, testing it...');
      
      try {
        // Try to send the existing subscription to backend
        const response = await api.post('/subscribe', { subscription: existingSubscription });
        console.log('✅ Backend accepted existing subscription:', response.data);
        return existingSubscription;
      } catch (apiError) {
        console.warn('⚠️ Existing subscription rejected by backend, will create new one');
        console.log('🗑️ Unsubscribing from invalid subscription...');
        
        try {
          await existingSubscription.unsubscribe();
          console.log('✅ Successfully unsubscribed from old subscription');
        } catch (unsubError) {
          console.warn('⚠️ Could not unsubscribe from old subscription:', unsubError);
        }
      }
    } else {
      console.log('ℹ️ No existing subscription found');
    }

    // Create new subscription with retry logic
    console.log('🆕 Creating new subscription...');
    console.log('🔑 Using VAPID key:', VAPID_PUBLIC_KEY.substring(0, 20) + '...');
    
    let applicationServerKey;
    try {
      applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      console.log('✅ VAPID key converted successfully');
    } catch (vapidError) {
      console.error('❌ Error converting VAPID key:', vapidError);
      throw new Error('Invalid VAPID key format');
    }
    
    let subscription;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 Subscription attempt ${retryCount + 1}/${maxRetries}...`);
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });
        
        console.log('✅ New subscription created successfully');
        console.log('📝 Subscription details:', JSON.stringify(subscription, null, 2));
        break; // Success, exit retry loop
        
      } catch (subscribeError) {
        console.error(`❌ Subscription attempt ${retryCount + 1} failed:`, subscribeError);
        
        if (subscribeError.name === 'AbortError' && retryCount < maxRetries - 1) {
          console.log('🔄 Retrying after clearing any remaining subscriptions...');
          
          // Try to clear any lingering subscriptions
          try {
            const currentSub = await registration.pushManager.getSubscription();
            if (currentSub) {
              await currentSub.unsubscribe();
              console.log('🗑️ Cleared lingering subscription');
            }
          } catch (clearError) {
            console.warn('⚠️ Could not clear lingering subscription:', clearError);
          }
          
          // Wait a bit before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
        } else {
          throw new Error(`Failed to create push subscription after ${retryCount + 1} attempts: ${subscribeError.message}`);
        }
      }
    }
    
    if (!subscription) {
      throw new Error('Failed to create subscription after all retries');
    }

    // Send subscription to backend
    console.log('📤 Sending new subscription to backend...');
    try {
      const response = await api.post('/subscribe', { subscription });
      console.log('✅ Backend response:', response.data);
      console.log('🎉 Push notification subscription completed successfully!');
      return subscription;
    } catch (apiError) {
      console.error('❌ Error sending subscription to backend:', apiError);
      console.error('Response status:', apiError.response?.status);
      console.error('Response data:', apiError.response?.data);
      throw new Error(`Backend API error: ${apiError.message}`);
    }
    
  } catch (error) {
    console.error('❌ subscribeUser failed with error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    throw error;
  }
};