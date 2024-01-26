/* eslint-disable @typescript-eslint/no-unused-vars */

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

export default function TopBar({ displayTime }: { displayTime?: string }) {
	return (
		<div className="flex justify-between">
			<div>Logo</div>
			<div>Location</div>
			<div>{displayTime || 'No Time Data'}</div>
			<div>Live</div>
			<div>Countdown</div>
			<div>Calendar</div>
			<div>Profile</div>
		</div>
	)	
}