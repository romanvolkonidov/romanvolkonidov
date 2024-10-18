const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotification = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET' && req.path === '/test') {
    res.status(200).send('Connection successful');
    return;
  }

  if (req.method === 'POST') {
    console.log('Received request:', req.body);

    const { userId, title, body, data, fcmToken } = req.body;

    if (!userId || !title || !body) {
      console.error('Missing required fields:', { userId, title, body });
      res.status(400).json({ error: 'Missing required fields: userId, title, or body' });
      return;
    }

    try {
      const userDoc = await admin.firestore().collection('students').doc(userId).get();
      
      if (!userDoc.exists) {
        console.error(`User with ID ${userId} not found`);
        res.status(404).json({ error: `User with ID ${userId} not found` });
        return;
      }

      const userData = userDoc.data();

      if (!userData.pushNotificationsEnabled) {
        console.log(`Push notifications not enabled for user ${userId}`);
        res.status(400).json({ error: 'Push notifications not enabled for this user' });
        return;
      }

      // Use the provided FCM token if available, otherwise use the one from Firestore
      const tokenToUse = fcmToken || userData.fcmToken;

      if (!tokenToUse) {
        console.error(`FCM token not found for user ${userId}`);
        res.status(400).json({ error: 'FCM token not found for this user' });
        return;
      }

      const message = {
        notification: { title, body },
        data: data || {},
        token: tokenToUse
      };

      try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        res.status(200).json({ message: 'Notification sent successfully' });
      } catch (messagingError) {
        console.error('Error sending notification:', messagingError);
        if (messagingError.code === 'messaging/registration-token-not-registered') {
          console.log(`FCM token for user ${userId} is invalid or unregistered. Removing token.`);
          
          // Remove the invalid token from Firestore
          await admin.firestore().collection('students').doc(userId).update({
            fcmToken: admin.firestore.FieldValue.delete(),
            pushNotificationsEnabled: false
          });

          res.status(400).json({ 
            error: 'FCM token is invalid or unregistered', 
            code: 'TOKEN_UNREGISTERED',
            message: 'Push notifications have been disabled. The user needs to re-enable them.'
          });
        } else {
          res.status(500).json({ error: `Error sending notification: ${messagingError.message}` });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: `Error fetching user data: ${error.message}` });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
});