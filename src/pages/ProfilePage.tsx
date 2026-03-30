import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Clock, Settings, Upload, Loader2 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { supabase } from "../services/supabaseClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { HistoryPage } from "./HistoryPage";

  const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
  geminiApiKey: z.string().optional(),
});

type ProfileValues = z.infer<typeof profileSchema>;

export const ProfilePage: React.FC = () => {
  const { user, profile, setProfile, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"details" | "history" | "settings">("details");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      bio: profile?.bio || "",
      geminiApiKey: profile?.gemini_api_key || "",
    },
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError("");
      
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars" as any)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars" as any)
        .getPublicUrl(filePath);

      const { error: updateError } = await (supabase
        .from("profiles") as any)
        .update({ avatar_url: publicUrl })
        .eq("user_id", user?.id);

      if (updateError) throw updateError;

      if (profile) {
        setProfile({ ...profile, avatar_url: publicUrl });
      }
      setSuccess("Avatar updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProfileValues) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const { error } = await (supabase
        .from("profiles") as any)
        .update({
          full_name: data.fullName,
          bio: data.bio,
          gemini_api_key: data.geminiApiKey,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      if (profile) {
        setProfile({ 
          ...profile, 
          full_name: data.fullName, 
          bio: data.bio || null,
          gemini_api_key: data.geminiApiKey || null
        });
      }
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Your Profile</h1>

      <div className="flex space-x-1 mb-8 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {[
          { id: "details", label: "Profile Details", icon: User },
          { id: "history", label: "Generation History", icon: Clock },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800"
          >
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-lg">
                {success}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    {...register("fullName")}
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white resize-none"
                    placeholder="Tell us a little about yourself..."
                  />
                  {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <HistoryPage />
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">API Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gemini API Key</label>
                    <button 
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-xs text-primary hover:underline"
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      {...register("geminiApiKey")}
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your Gemini API key..."
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                    />
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Your API key is used for all generations. If left blank, the system's default key will be used.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Theme Preference</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Choose how Nexus AI looks to you</p>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => {
                        document.documentElement.classList.remove("dark");
                        localStorage.setItem("theme", "light");
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-white dark:hover:bg-slate-700"
                    >
                      Light
                    </button>
                    <button
                      onClick={() => {
                        document.documentElement.classList.add("dark");
                        localStorage.setItem("theme", "dark");
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:bg-white dark:hover:bg-slate-700"
                    >
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive updates about your generations</p>
                  </div>
                  <button className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Product Updates</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Stay informed about new features</p>
                  </div>
                  <button className="w-12 h-6 bg-primary rounded-full relative transition-colors">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-red-600 mb-6">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Clear All History</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete all your generation history</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("history")}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Sign Out</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Sign out of your account on this device</p>
                  </div>
                  <button 
                    onClick={async () => {
                      await signOut();
                      window.location.href = "/auth";
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
