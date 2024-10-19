import { useEffect, useState } from 'react';
import * as PusherPushNotifications from "@pusher/push-notifications-web";

const usePusherBeams = () => {
  const [beamsClient, setBeamsClient] = useState(null);

  useEffect(() => {
    const client = new PusherPushNotifications.Client({
      instanceId: '7fab351a-30a3-46a6-9f58-87c97aaf305e',
    });

    client.start()
      .then(() => client.addDeviceInterest('hello'))
      .then(() => {
        console.log('Successfully registered and subscribed!');
        setBeamsClient(client);
      })
      .catch(console.error);

    return () => {
      if (client) {
        client.clearAllState();
      }
    };
  }, []);

  return beamsClient;
};

export default usePusherBeams;