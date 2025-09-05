// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyA9l2iAJhYuM7gTulAlpm5Dq0sGA7kSank',
	authDomain: 'scafoma-ub.firebaseapp.com',
	projectId: 'scafoma-ub',
	storageBucket: 'scafoma-ub.firebasestorage.app',
	messagingSenderId: '61441138394',
	appId: '1:61441138394:web:94fa69fbaeeaf2cda48fe3',
	measurementId: 'G-MVB8K1KFX8',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})
export const db = getFirestore(app)
