import { getMessages } from '../messages';

export const stayTopics = ['all', 'location', 'capacity', 'amenities', 'nearby'];

export function getAgentTools(locale: string) {
	const m = getMessages(locale);
	return {
		stay: {
			name: 'get_stay_information',
			title: m.webmcp_stay_tool_title,
			description: m.webmcp_stay_description
		},
		booking: {
			name: 'get_booking_options',
			title: m.webmcp_booking_tool_title,
			description: m.webmcp_booking_description
		},
		excursions: {
			name: 'find_local_excursions',
			title: m.webmcp_excursions_tool_title,
			description: m.webmcp_excursions_description
		}
	};
}
