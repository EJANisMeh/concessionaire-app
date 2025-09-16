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

let auth
if (isReactNative) {
	let getReactNativePersistence: any = undefined
	try {
		getReactNativePersistence =
			require('firebase/auth/react-native')?.getReactNativePersistence
	} catch (e) {
		console.warn(
			"Could not load 'firebase/auth/react-native' — falling back to default auth initialization.",
			e && (e as Error).message ? (e as Error).message : e
		)
	}

	if (typeof getReactNativePersistence === 'function') {
		try {
			auth = initializeAuth(app, {
				persistence: getReactNativePersistence(AsyncStorage),
			})
		} catch (e) {
			console.warn(
				'initializeAuth with RN persistence failed — falling back to getAuth().',
				e && (e as Error).message ? (e as Error).message : e
			)
			try {
				auth = getAuth(app)
				auth.setPersistence(inMemoryPersistence)
			} catch (e2) {
				console.warn(
					'getAuth() also failed while falling back; auth will be undefined.',
					e2 && (e2 as Error).message ? (e2 as Error).message : e2
				)
				auth = undefined
			}
		}
	} else {
		try {
			auth = initializeAuth(app)
		} catch (e) {
			console.warn(
				'initializeAuth() failed — falling back to getAuth().',
				e && (e as Error).message ? (e as Error).message : e
			)
			try {
				auth = getAuth(app)
				auth.setPersistence(inMemoryPersistence)
			} catch (e2) {
				console.warn(
					'getAuth() failed while falling back from initializeAuth(); auth will be undefined.',
					e2 && (e2 as Error).message ? (e2 as Error).message : e2
				)
				auth = undefined
			}
		}
	}
} else {
	auth = getAuth(app)
	auth.setPersistence(inMemoryPersistence)
}
export { auth }
