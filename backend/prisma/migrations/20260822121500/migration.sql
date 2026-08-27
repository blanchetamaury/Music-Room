-- CreateTable
CREATE TABLE "follows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "fortytwo_oauth" (
    "id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "valid_until" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fortytwo_oauth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Google_oauth" (
    "id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_type" TEXT,
    "expires_in" INTEGER,

    CONSTRAINT "Google_oauth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("userId","trackId")
);

-- CreateTable
CREATE TABLE "play_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,

    CONSTRAINT "play_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_tracks" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedById" TEXT,

    CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratelimit_login" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratelimit_login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetPassword" (
    "id" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResetPassword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracks" (
    "id" TEXT NOT NULL,
    "deezerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleShort" TEXT,
    "duration" INTEGER NOT NULL,
    "isrc" TEXT,
    "explicit" BOOLEAN NOT NULL DEFAULT false,
    "previewUrl" TEXT,
    "releaseDate" TIMESTAMP(3),
    "rank" INTEGER,
    "trackPosition" INTEGER,
    "diskNumber" INTEGER,
    "artistDeezerId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "artistPicture" TEXT,
    "albumDeezerId" TEXT NOT NULL,
    "albumTitle" TEXT NOT NULL,
    "albumCover" TEXT,
    "albumCoverBig" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT,
    "avatarUrl" TEXT,
    "deezerUserId" TEXT,
    "deezerAccessToken" TEXT,
    "fortytwo_oauth_id" TEXT,
    "fortytwo_user_id" INTEGER,
    "google_oauth_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "likes_trackId_idx" ON "likes"("trackId");

-- CreateIndex
CREATE INDEX "play_history_userId_playedAt_idx" ON "play_history"("userId", "playedAt");

-- CreateIndex
CREATE INDEX "playlists_ownerId_idx" ON "playlists"("ownerId");

-- CreateIndex
CREATE INDEX "playlist_tracks_playlistId_position_idx" ON "playlist_tracks"("playlistId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "playlist_tracks_playlistId_trackId_key" ON "playlist_tracks"("playlistId", "trackId");

-- CreateIndex
CREATE INDEX "ratelimit_login_user_id_created_at_idx" ON "ratelimit_login"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "ratelimit_login_ip_created_at_idx" ON "ratelimit_login"("ip", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassword_mail_code_key" ON "ResetPassword"("mail", "code");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_deezerId_key" ON "tracks"("deezerId");

-- CreateIndex
CREATE INDEX "tracks_artistDeezerId_idx" ON "tracks"("artistDeezerId");

-- CreateIndex
CREATE INDEX "tracks_albumDeezerId_idx" ON "tracks"("albumDeezerId");

-- CreateIndex
CREATE INDEX "tracks_title_idx" ON "tracks"("title");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_deezerUserId_key" ON "users"("deezerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_oauth_id_key" ON "users"("fortytwo_oauth_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_fortytwo_user_id_key" ON "users"("fortytwo_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_oauth_id_key" ON "users"("google_oauth_id");

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_history" ADD CONSTRAINT "play_history_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_fortytwo_oauth_id_fkey" FOREIGN KEY ("fortytwo_oauth_id") REFERENCES "fortytwo_oauth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_google_oauth_id_fkey" FOREIGN KEY ("google_oauth_id") REFERENCES "Google_oauth"("id") ON DELETE CASCADE ON UPDATE CASCADE;
