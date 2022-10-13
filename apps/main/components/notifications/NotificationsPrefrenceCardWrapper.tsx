import { NotificationPreferenceCard } from 'apps/main/components/notifications/NotificationPreferenceCard'
import { useNotificationSocket } from 'apps/main/components/NotificationSocketProvider'
import { notificationPreferences } from 'apps/main/features/notifications/consts'
import { NOTIFICATION_CHANGE, NotificationChange } from 'apps/main/features/notifications/notificationChange'
import {
  NotificationChannelTypes,
  NotificationSubscriptionTypes,
} from 'apps/main/features/notifications/types'
import { useUIChanges } from 'apps/main/helpers/uiChangesHook'
import React, { useCallback, useEffect } from 'react'

interface NotificationPreferenceCardWrapperProps {
  account: string
}

export function NotificationPreferenceCardWrapper({
  account,
}: NotificationPreferenceCardWrapperProps) {
  const { socket } = useNotificationSocket()
  const [notificationsState] = useUIChanges<NotificationChange>(NOTIFICATION_CHANGE)

  useEffect(() => {
    if (
      !notificationsState.allActiveChannels.find(
        (item) => item.id === NotificationChannelTypes.APPLICATION,
      )
    ) {
      socket?.emit('setchannels', {
        address: account,
        channels: [
          { id: NotificationChannelTypes.APPLICATION, channelConfiguration: '' },
          ...notificationsState.allActiveChannels,
        ],
      })
    }
  }, [])

  const subscriptionsHandler = useCallback(
    (subscriptionType: NotificationSubscriptionTypes, isEnabled: boolean) => {
      if (isEnabled) {
        socket?.emit('setsubscriptions', {
          address: account,
          subscriptionTypes: [
            ...notificationsState.allActiveSubscriptions.map((item) => item.id),
            subscriptionType,
          ],
        })
      } else {
        const afterSubscriptions = notificationsState.allActiveSubscriptions
          .filter((item) => item.id !== subscriptionType)
          .map((item) => item.id)

        socket?.emit('setsubscriptions', {
          address: account,
          subscriptionTypes: afterSubscriptions,
        })
      }
    },
    [socket, notificationsState],
  )

  return (
    <>
      {notificationPreferences.map((preference) => (
        <NotificationPreferenceCard
          key={preference.notificationType}
          checked={
            !!notificationsState.allActiveSubscriptions.find(
              (item) => item.id === preference.notificationType,
            )
          }
          {...preference}
          onChangeHandler={(isEnabled) =>
            subscriptionsHandler(preference.notificationType, isEnabled)
          }
        />
      ))}
      {/* TODO UNCOMMENTED WHEN E-MAIL HANDLING WILL BE HANDLED IN API*/}
      {/*<NotificationsEmailPreferences account={account} />*/}
    </>
  )
}
