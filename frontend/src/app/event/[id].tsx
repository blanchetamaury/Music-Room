import { EventDetailScreen } from '@/src/components/events/EventDetailScreen';
import { RouteShell } from '@/src/components/home/RouteShell';
import React from 'react';

export default function EventDetailRoute() {
	return (
		<RouteShell activeTab="events">
			<EventDetailScreen />
		</RouteShell>
	);
}
