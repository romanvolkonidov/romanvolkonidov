import { useEffect, useState, useCallback } from 'react';
import * as PusherPushNotifications from "@pusher/push-notifications-web";

const usePusherBeams = (studentId) => {
  const [beamsClient, setBeamsClient] = useState(null);

  const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
    url: "https://your-api.example.com/pusher/beams-auth", // Replace with your actual auth endpoint
  });

  const initializeBeams = useCallback(() => {
    if (!studentId) return;

    const client = new PusherPushNotifications.Client({
      instanceId: '566f3043-3487-4a6e-b12a-d4042eaabb5e',
    });

    client.start()
      .then(() => {
        console.log('Successfully registered client');
        setBeamsClient(client);
        return client;
      })
      .then((client) => client.setUserId(studentId, beamsTokenProvider))
      .then(() => {
        console.log(`User ${studentId} associated with device`);
        return beamsClient.addDeviceInterest(`student-${studentId}`);
      })
      .then(() => {
        console.log(`Subscribed to personal updates for student ${studentId}`);
      })
      .catch(console.error);
  }, [studentId]);

  useEffect(() => {
    initializeBeams();

    return () => {
      if (beamsClient) {
        beamsClient.clearAllState();
      }
    };
  }, [initializeBeams]);

  const unsubscribe = useCallback(() => {
    if (beamsClient) {
      beamsClient.removeDeviceInterest(`student-${studentId}`)
        .then(() => console.log(`Unsubscribed from updates for student ${studentId}`))
        .catch(console.error);
    }
  }, [beamsClient, studentId]);

  return { beamsClient, unsubscribe };
};

export default usePusherBeams;