interface EventInfo {
  title: string;
  date: Date | string;
  startTime: string;
  address: string;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function wrapper(heading: string, bodyHtml: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1f2933;">
      <h2 style="color: #ea580c; margin-bottom: 16px;">🪔 Yuvatma Mangaluru</h2>
      <h3 style="margin-bottom: 12px;">${heading}</h3>
      ${bodyHtml}
      <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        You're receiving this because you have email notifications enabled. You can change this anytime in your profile preferences.
      </p>
    </div>
  `;
}

function eventDetailsBlock(event: EventInfo) {
  return `
    <div style="background: #fff7ed; border-radius: 8px; padding: 12px 16px; margin: 12px 0;">
      <p style="margin: 4px 0;"><strong>${event.title}</strong></p>
      <p style="margin: 4px 0;">📅 ${formatDate(event.date)} at ${event.startTime}</p>
      <p style="margin: 4px 0;">📍 ${event.address}</p>
    </div>
  `;
}

export function invitationEmail(hostName: string, event: EventInfo) {
  return wrapper(
    'You have a new event invitation!',
    `<p>${hostName} invited you to their event:</p>${eventDetailsBlock(event)}<p>Log in to Yuvatma Mangaluru to accept or decline.</p>`,
  );
}

export function invitationAcceptedEmail(memberName: string, event: EventInfo) {
  return wrapper(
    'Invitation Accepted',
    `<p><strong>${memberName}</strong> accepted your invitation to:</p>${eventDetailsBlock(event)}`,
  );
}

export function invitationDeclinedEmail(memberName: string, event: EventInfo) {
  return wrapper(
    'Invitation Declined',
    `<p><strong>${memberName}</strong> declined your invitation to:</p>${eventDetailsBlock(event)}`,
  );
}

export function eventUpdatedEmail(event: EventInfo) {
  return wrapper(
    'Event Updated',
    `<p>An event you're invited to has been updated:</p>${eventDetailsBlock(event)}<p>Please check the latest details in the app.</p>`,
  );
}

export function eventCancelledEmail(event: EventInfo) {
  return wrapper(
    'Event Cancelled',
    `<p>The following event has been cancelled by the host:</p>${eventDetailsBlock(event)}`,
  );
}

export function eventRestoredEmail(event: EventInfo) {
  return wrapper(
    'Event Restored',
    `<p>Good news — this event is active again:</p>${eventDetailsBlock(event)}`,
  );
}

export function reminder24hEmail(event: EventInfo) {
  return wrapper(
    'Event Reminder — Tomorrow',
    `<p>This is a reminder that the following event is happening tomorrow:</p>${eventDetailsBlock(event)}`,
  );
}

export function reminder1hEmail(event: EventInfo) {
  return wrapper(
    'Event Reminder — Starting Soon',
    `<p>This is a reminder that the following event starts in about 1 hour:</p>${eventDetailsBlock(event)}`,
  );
}
