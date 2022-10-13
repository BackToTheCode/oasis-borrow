import { NotificationCard } from 'apps/main/components/notifications/NotificationCard'
import { NotificationsEmptyList } from 'apps/main/components/notifications/NotificationsEmptyList'
import { useNotificationSocket } from 'apps/main/components/NotificationSocketProvider'
import { getNotificationTitle } from 'apps/main/features/notifications/helpers'
import { NOTIFICATION_CHANGE, NotificationChange } from 'apps/main/features/notifications/notificationChange'
import { NotificationTypes } from 'apps/main/features/notifications/types'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import React from 'react'

interface NotificationCardsWrapperProps {
  account: string
}

export function NotificationCardsWrapper({ account }: NotificationCardsWrapperProps) {
  const { socket } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  const validNotifications = notificationsState.allNotifications
    .filter((item) => item.notificationType in NotificationTypes)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))

  function markReadHandler(notificationId: string) {
    socket?.emit('markread', {
      address: account,
      notificationId,
    })
  }

  function editHandler(notificationId: string) {
    markReadHandler(notificationId)
    socket?.emit('markread', {
      address: account,
      notificationId,
    })
  }

  return (
    <>
      {validNotifications.length > 0 ? (
        <>
          {validNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              {...item}
              title={getNotificationTitle({
                type: item.notificationType,
                timestamp: item.timestamp,
                additionalData: item.additionalData,
              })}
              markReadHandler={markReadHandler}
              editHandler={editHandler}
            />
          ))}
        </>
      ) : (
        <NotificationsEmptyList />
      )}
    </>
  )
}
