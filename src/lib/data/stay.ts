import { getMessages, t } from '../messages';

const cabins = [
	{
		id: 'cab-1',
		capacity: 7,
		bedrooms: 2,
		homepageBedrooms: 2,
		gallerySubtitleKey: 'gallery_cab1_subtitle',
		roomKeys: ['room_living_dining', 'room_kitchen', 'room_bathroom']
	},
	{
		id: 'cab-2',
		capacity: 4,
		bedrooms: null,
		homepageBedrooms: 2,
		gallerySubtitleKey: 'gallery_cab2_subtitle',
		roomKeys: ['room_kitchen_dining', 'room_living_futons', 'room_bathroom']
	}
];

export function getCabins(locale: string) {
	const m = getMessages(locale);
	return cabins.map(
		({ id, capacity, bedrooms, homepageBedrooms, gallerySubtitleKey, roomKeys }) => {
			const rooms = roomKeys.map((key) => m[key]);
			return {
				id,
				capacity,
				bedrooms,
				title: t(locale, 'cabin_title', { capacity }),
				mobileGuests: t(locale, 'cabin_mobile_guests', { capacity }),
				floors: m[`cabin_${capacity}_floors`],
				alt: m[`cabin_${capacity}_alt`],
				rooms: bedrooms === null ? rooms : [m[`room_bedrooms_${bedrooms}`], ...rooms],
				homepageRooms: [m[`room_bedrooms_${homepageBedrooms}`], ...rooms],
				gallerySubtitle: m[gallerySubtitleKey]
			};
		}
	);
}

export const amenityIcons = {
	amenity_pets: 'mascota',
	amenity_parking: 'auto',
	amenity_heating: 'calefaccion',
	amenity_wifi: 'wifi',
	amenity_grill: 'parrilla',
	amenity_hot_water: 'agua',
	amenity_tv: 'tele',
	amenity_bathroom_kit: 'higiene',
	amenity_bedding: 'sabanas',
	amenity_patio: 'patio',
	amenity_fire_extinguisher: 'extintor',
	amenity_hair_dryer: 'secador',
	amenity_kitchen_kit: 'cocina',
	amenity_smoking: 'fumadores',
	amenity_extra_pillows: 'almohada',
	amenity_first_aid: 'botiquin'
};
