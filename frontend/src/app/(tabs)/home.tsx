import { HomePageContent } from '@/src/components/home/HomePageContent';
import { RouteShell } from '@/src/components/home/RouteShell';
import React, { useState } from 'react';

export default function HomeScreen() {
	const [activeTrack, setActiveTrack] = useState(0);

	return (
		<RouteShell activeTab="home">
			<HomePageContent activeTrack={activeTrack} onSelect={setActiveTrack} />
		</RouteShell>
	);
}
