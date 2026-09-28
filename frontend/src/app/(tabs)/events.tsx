import { EventListScreen } from '@/src/components/events/EventListScreen';
import { RouteShell } from '@/src/components/home/RouteShell';
import React from 'react';

export default function EventsRoute() {
	return (
		<RouteShell activeTab="events">
			<EventListScreen />
		</RouteShell>
	);
}
