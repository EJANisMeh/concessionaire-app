import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, inMemoryPersistence, initializeAuth } from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const isReactNative =
	typeof navigator !== 'undefined' &&
	(navigator as any).product === 'ReactNative'

const firebaseConfig = {
	apiKey: 'AIzaSyA9l2iAJhYuM7gTulAlpm5Dq0sGA7kSank',
	authDomain: 'scafoma-ub.firebaseapp.com',
	projectId: 'scafoma-ub',
	storageBucket: 'scafoma-ub.appspot.com',
	messagingSenderId: '61441138394',
	appId: '1:61441138394:web:94fa69fbaeeaf2cda48fe3',
	measurementId: 'G-MVB8K1KFX8',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

let _auth: any = undefined
let _authInitialized = false

export function getAuthInstance() {
	if (_authInitialized) return _auth
	_authInitialized = true

	if (isReactNative) {
		let getReactNativePersistence: any = undefined
		try {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			getReactNativePersistence =
				require('firebase/auth/react-native')?.getReactNativePersistence
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(
				"Could not load 'firebase/auth/react-native' — will try fallbacks.",
				e && (e as Error).message ? (e as Error).message : e
			)
		}

		if (typeof getReactNativePersistence === 'function') {
			try {
				_auth = initializeAuth(app, {
					persistence: getReactNativePersistence(AsyncStorage),
				})
				return _auth
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn(
					'initializeAuth with RN persistence failed — attempting getAuth() fallback.',
					e && (e as Error).message ? (e as Error).message : e
				)
			}
		}

		try {
			_auth = initializeAuth(app)
			return _auth
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(
				'initializeAuth() failed — attempting getAuth() fallback.',
				e && (e as Error).message ? (e as Error).message : e
			)
		}
	}

	try {
		_auth = getAuth(app)
		_auth.setPersistence(inMemoryPersistence)
		return _auth
	} catch (e2) {
		// eslint-disable-next-line no-console
		console.warn(
			'getAuth() failed while falling back; auth will be undefined.',
			e2 && (e2 as Error).message ? (e2 as Error).message : e2
		)
		_auth = undefined
		return _auth
	}
}

export default getAuthInstance
