import { HomePageContent } from '@/src/components/home/HomePageContent';
import { RouteShell } from '@/src/components/home/RouteShell';
import React from 'react';

export default function HomeScreen() {
	return (
		<RouteShell activeTab="home">
			<HomePageContent />
		</RouteShell>
	);
}
