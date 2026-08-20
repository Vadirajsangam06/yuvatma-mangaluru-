import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsError, setPrefsError] = useState('');
  const [prefsSuccess, setPrefsSuccess] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isStrong = hasMinLength && hasUpper && hasLower && hasNumber;

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setProfileImage(user.profileImage || '');
    setBio(user.bio || '');
    setLocation(user.location || '');
    setNotifyInApp(user.notifyInApp);
    setNotifyEmail(user.notifyEmail);
    setNotifyWhatsapp(user.notifyWhatsapp);
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);
    try {
      const { data } = await api.patch('/users/me', {
        name,
        email,
        phone: phone || undefined,
        profileImage: profileImage || undefined,
        bio: bio || undefined,
        location: location || undefined,
      });
      updateUser(data.data);
      setProfileSuccess(true);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsError('');
    setPrefsSuccess(false);
    setPrefsLoading(true);
    try {
      const { data } = await api.patch('/users/me/preferences', {
        notifyInApp,
        notifyEmail,
        notifyWhatsapp,
      });
      if (user) updateUser({ ...user, ...data.data });
      setPrefsSuccess(true);
    } catch (err: any) {
      setPrefsError(err.message || 'Failed to update preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!isStrong) {
      setPasswordError('New password does not meet the strength requirements.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4 font-sans">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted font-sans p-4">
      <div className="max-w-lg mx-auto py-8 space-y-6">
        <Link to="/" className="text-saffron-600 hover:underline text-sm inline-block">← Back to Dashboard</Link>

        {/* Profile Details */}
        <div className="bg-surface p-8 rounded-xl shadow-md border border-border">
          <h1 className="text-2xl font-bold text-saffron-600 mb-6">Your Profile</h1>

          {profileError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{profileError}</div>}
          {profileSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">Profile updated successfully.</div>}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Profile Image URL</label>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                rows={3}
                maxLength={300}
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
            >
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-surface p-8 rounded-xl shadow-md border border-border">
          <h2 className="text-xl font-bold mb-1">Change Password</h2>
          <p className="text-sm text-text-muted mb-6">Update your account password for enhanced security.</p>

          {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{passwordError}</div>}
          {passwordSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">Password changed successfully.</div>}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* Password strength checklist */}
            {newPassword && (
              <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
                <p className="font-medium text-text mb-1">New password requirements:</p>
                <p className={hasMinLength ? 'text-green-700' : 'text-text-muted'}>
                  {hasMinLength ? '✓' : '○'} At least 8 characters
                </p>
                <p className={hasUpper ? 'text-green-700' : 'text-text-muted'}>
                  {hasUpper ? '✓' : '○'} At least 1 uppercase letter
                </p>
                <p className={hasLower ? 'text-green-700' : 'text-text-muted'}>
                  {hasLower ? '✓' : '○'} At least 1 lowercase letter
                </p>
                <p className={hasNumber ? 'text-green-700' : 'text-text-muted'}>
                  {hasNumber ? '✓' : '○'} At least 1 number
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              {confirmNewPassword && newPassword !== confirmNewPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !isStrong || newPassword !== confirmNewPassword}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
            >
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-surface p-8 rounded-xl shadow-md border border-border">
          <h2 className="text-xl font-bold mb-1">Notification Preferences</h2>
          <p className="text-sm text-text-muted mb-6">Choose how you'd like to be notified.</p>

          {prefsError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{prefsError}</div>}
          {prefsSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">Preferences updated successfully.</div>}

          <form onSubmit={handlePreferencesSubmit} className="space-y-3">
            <label className="flex items-center justify-between bg-muted rounded-lg p-3 cursor-pointer">
              <span className="text-sm font-medium">In-app notifications</span>
              <input
                type="checkbox"
                className="w-4 h-4 accent-saffron-500"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between bg-muted rounded-lg p-3 cursor-pointer">
              <span className="text-sm font-medium">Email notifications</span>
              <input
                type="checkbox"
                className="w-4 h-4 accent-saffron-500"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between bg-muted rounded-lg p-3 cursor-pointer">
              <span className="text-sm font-medium">WhatsApp notifications</span>
              <input
                type="checkbox"
                className="w-4 h-4 accent-saffron-500"
                checked={notifyWhatsapp}
                onChange={(e) => setNotifyWhatsapp(e.target.checked)}
              />
            </label>

            <button
              type="submit"
              disabled={prefsLoading}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70 mt-4"
            >
              {prefsLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
