import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, User, Lock, Save, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileView() {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, loading, error, clearError } = useAuthStore();

  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [direction, setDirection] = useState(0);

  const tabs = ['profile', 'password'];
  const tabLabels = ['Profile', 'Password'];

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    clearError();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileData.name || !profileData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error(error || 'Failed to change password');
    }
  };

  const handleSwipe = (swipeDirection: number) => {
    const newIndex = activeTab + swipeDirection;
    if (newIndex >= 0 && newIndex < tabs.length) {
      setDirection(swipeDirection);
      setActiveTab(newIndex);
    }
  };

  const handleDotClick = (index: number) => {
    setDirection(index > activeTab ? 1 : -1);
    setActiveTab(index);
  };

  const renderProfileTab = () => (
    <Card>
      <CardHeader>
        <h2 className="text-lg sm:text-xl font-semibold">Profile Information</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Update your account details
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={profileData.name}
              onChange={handleProfileChange}
              disabled={loading || user?.isAdmin}
              className="h-10 sm:h-11 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={profileData.email}
              onChange={handleProfileChange}
              disabled={loading || user?.isAdmin}
              className="h-10 sm:h-11 text-sm"
            />
          </div>

          {user?.isAdmin && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-900">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                Admin account details cannot be modified
              </p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-xs sm:text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          {!user?.isAdmin && (
            <Button
              type="submit"
              className="w-full sm:w-auto text-sm"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );

  const renderPasswordTab = () => (
    <Card>
      <CardHeader>
        <h2 className="text-lg sm:text-xl font-semibold">Change Password</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Update your password to keep your account secure
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                className="h-10 sm:h-11 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password (min. 6 characters)"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                className="h-10 sm:h-11 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                className="h-10 sm:h-11 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-xs sm:text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full sm:w-auto text-sm"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Changing password...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Profile Settings</h1>
            <p className="text-sm text-muted-foreground truncate">Manage your account settings</p>
          </div>
        </div>

        {/* Mobile: Swipeable View */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleSwipe(-1)}
              disabled={activeTab === 0}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 0
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold">{tabLabels[activeTab]}</h3>

            <button
              onClick={() => handleSwipe(1)}
              disabled={activeTab === tabs.length - 1}
              className={`p-2 rounded-lg transition-colors ${
                activeTab === tabs.length - 1
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 300 : -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -300 : 300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 0 ? renderProfileTab() : renderPasswordTab()}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-1 mt-4">
            {tabs.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-0.5 rounded-full transition-all ${
                  index === activeTab
                    ? 'w-3 bg-primary'
                    : 'w-0.5 bg-muted-foreground/30'
                }`}
                aria-label={`Go to ${tabLabels[index]}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop: Traditional Tabs */}
        <Tabs defaultValue="profile" className="w-full hidden sm:block">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Password</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            {renderProfileTab()}
          </TabsContent>

          <TabsContent value="password" className="mt-0">
            {renderPasswordTab()}
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg sm:text-xl font-semibold">Account Information</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 text-sm">
              <span className="text-muted-foreground">Account Created:</span>
              <span className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 text-sm">
              <span className="text-muted-foreground">Account Type:</span>
              <span className="font-medium">
                {user?.isAdmin ? (
                  <span className="text-blue-600 dark:text-blue-400">Administrator</span>
                ) : (
                  'Standard User'
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
