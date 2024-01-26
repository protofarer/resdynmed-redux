/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from '@remix-run/react';

import { useTimeStore } from '~/stores/timeStore';

interface NavItem {
	name: string;
	link?: string;
	onClick?: () => void;
	icon?: React.ReactNode;
	divider?: boolean;
}

// leftmost, always on
const GLOBAL_TOOLBAR: NavItem[] = [
	{
		name: 'Home',
		link: '/',
		// icon: <AppLogo />
	},
	{
		name: 'Live',
		link: '/live',
		// icon: <LiveStatus />
	},
]

// dropdown from profile
const AUTH_PROFILE_NAV: NavItem[] = [
	{
		name: 'Profile',
		link: '/account?path=profile',
		// icon: <PersonOutline />
	},
	{
		name: 'Timer',
		link: '/timer',
		// icon: <TimerPortalIcon />
	},
	{
		name: 'Logout',
		link: '/logout',
		// icon: <LogoutIcon />
	}
	// CHAT, MAP, STATS, SETTINGS ...
]

const UNAUTH_PROFILE_NAV: NavItem[] = [
	{
		name: 'Login',
		link: '/login',
		// icon: <LoginIcon />
	},
	{
		name: 'Register',
		link: '/register',
		// icon: <RegisterIcon />
	}
]


const NOLOC_SESSION_TOOLBAR: NavItem[] = [
	{
		name: 'Location',
		link: '/location',
		// icon: <SetLocationIcon />
	}
]


// When user has set a location, w/ or w/o login
// loc is set
const LOC_SESSION_TOOLBAR: NavItem[] =[
	{
		name: 'Session Timer',
		link: '/timer',
		// icon: <TimerIcon />
	},
	{
		name: 'Calendars',
		link: '/calendars',
		// icon: <CalendarIcon />
	},
]

export default function TopBar() {
	const displayTime = useTimeStore((state) => state.displayTime)

	return (
		<div className='flex justify-between border-b-2 border-blue-400'>
			<div className='flex gap-x-4 border'>
				<Link to='/' className='text-blue-700 font-bold'>Logo</Link>
				<div>Location.....</div>
				<div>{displayTime || 'Need Server Data'}</div>
				<div>Live..</div>
			</div>
			<div className='flex gap-x-2 border'>
				<div>CTDN_TMR</div>
				<div>CALENDAR</div>
				<div>Profile</div>
			</div>
		</div>
	)	
}