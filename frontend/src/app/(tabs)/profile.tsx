import { ProfileScreen } from '@/src/components/home/ProfileScreen';
import { RouteShell } from '@/src/components/home/RouteShell';
import React from 'react';

export default function ProfileRoute() {
	return (
		<RouteShell activeTab="profile">
			<ProfileScreen />
		</RouteShell>
	);
}
