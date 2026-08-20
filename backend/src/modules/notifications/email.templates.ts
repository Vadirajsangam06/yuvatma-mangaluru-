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

export function passwordResetEmail(name: string, resetUrl: string, expiresInMinutes = 60) {
  const content = `
    <p>Namaste <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your Yuvatma Mangaluru account.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
    </div>
    <p style="font-size: 13px; color: #4b5563;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #ea580c;">${resetUrl}</p>
    <p style="font-size: 13px; color: #4b5563; margin-top: 16px;">This link will expire in <strong>${expiresInMinutes} minutes</strong> and can only be used once.</p>
    <p style="font-size: 13px; color: #6b7280; margin-top: 16px;">If you did not request a password reset, you can safely ignore this email — your password will remain unchanged.</p>
  `;
  return wrapper('Password Reset Request', content);
}

export function passwordChangedEmail(name: string) {
  const content = `
    <p>Namaste <strong>${name}</strong>,</p>
    <p>Your password for Yuvatma Mangaluru has been successfully changed.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; margin: 16px 0; color: #166534;">
      <p style="margin: 0; font-weight: 500;">✓ Your account security has been updated.</p>
    </div>
    <p style="font-size: 13px; color: #6b7280; margin-top: 16px;">If you did not make this change, please contact our support team immediately or reset your password to secure your account.</p>
  `;
  return wrapper('Password Changed Successfully', content);
}

