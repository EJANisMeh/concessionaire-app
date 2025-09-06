import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
	getAuth,
	inMemoryPersistence,
	initializeAuth,
	getReactNativePersistence,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

const isReactNative =
	typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

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
	auth = initializeAuth(app, {
		persistence: getReactNativePersistence(AsyncStorage),
	})
} else {
	auth = getAuth(app)
	auth.setPersistence(inMemoryPersistence)
}
export { auth }
