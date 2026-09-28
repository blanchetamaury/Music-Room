-- Audit P0 gaps: OAuth `state` storage, session revocation, profile preferences and
-- per-field visibility, and server-side device playback state.

-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'FORTYTWO');

-- CreateEnum
CREATE TYPE "ProfileField" AS ENUM ('PROFILE_BASICS', 'MUSIC_PREFERENCES', 'LIKES', 'PLAYLISTS', 'PLAY_HISTORY');

-- CreateEnum
CREATE TYPE "ProfileVisibilityLevel" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PlaybackStatus" AS ENUM ('IDLE', 'PLAYING', 'PAUSED');

-- CreateTable
CREATE TABLE "oauth_states" (
    "id" TEXT NOT NULL,
    "stateHash" TEXT NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "clientType" TEXT NOT NULL,
    "linkUserId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revoked_sessions" (
    "jti" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revoked_sessions_pkey" PRIMARY KEY ("jti")
);

-- CreateTable
CREATE TABLE "music_preferences" (
    "userId" TEXT NOT NULL,
    "favoriteGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favoriteArtists" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favoriteAlbums" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favoriteTracks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "music_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "profile_visibilities" (
    "userId" TEXT NOT NULL,
    "field" "ProfileField" NOT NULL,
    "visibility" "ProfileVisibilityLevel" NOT NULL DEFAULT 'PUBLIC',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_visibilities_pkey" PRIMARY KEY ("userId", "field")
);

-- CreateTable
CREATE TABLE "device_playback_states" (
    "deviceId" TEXT NOT NULL,
    "status" "PlaybackStatus" NOT NULL DEFAULT 'IDLE',
    "queue" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentTrackId" TEXT,
    "positionMs" INTEGER NOT NULL DEFAULT 0,
    "volume" INTEGER NOT NULL DEFAULT 100,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_playback_states_pkey" PRIMARY KEY ("deviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_states_stateHash_key" ON "oauth_states"("stateHash");

-- CreateIndex
CREATE INDEX "oauth_states_expiresAt_idx" ON "oauth_states"("expiresAt");

-- CreateIndex
CREATE INDEX "revoked_sessions_userId_idx" ON "revoked_sessions"("userId");

-- CreateIndex
CREATE INDEX "revoked_sessions_expiresAt_idx" ON "revoked_sessions"("expiresAt");

-- AddForeignKey
ALTER TABLE "oauth_states" ADD CONSTRAINT "oauth_states_linkUserId_fkey" FOREIGN KEY ("linkUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music_preferences" ADD CONSTRAINT "music_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_visibilities" ADD CONSTRAINT "profile_visibilities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_playback_states" ADD CONSTRAINT "device_playback_states_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
