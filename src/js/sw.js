// Firebase Messaging Service Worker

self.addEventListener("push", function (event) {
  const notif = event.data.json().notification;
  event.waitUntil(
    self.registration.showNotification(notif.title, {
      body: notif.body,
      icon: notif.icon,
      badge: notif.badge,
      data: notif.click_action,
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.waitUntil(clients.openWindow(event.notification.data));
});
