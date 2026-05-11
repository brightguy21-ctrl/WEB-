import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const authService = {
  /**
   * Register new user
   */
  async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        ...userData,
        userType: userData.userType || 'customer', // admin, customer, reseller
        createdAt: new Date().toISOString(),
        isVerified: false,
        phoneVerified: false,
      });

      return { success: true, user };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      // Check if admin
      if (userData.userType === 'admin') {
        // Verify admin credentials
        const adminId = process.env.REACT_APP_ADMIN_ID;
        if (user.uid !== adminId) {
          throw new Error('Not authorized as admin');
        }
      }

      return { success: true, user: { ...user, ...userData } };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists, if not create
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          userType: 'customer',
          createdAt: new Date().toISOString(),
          isVerified: true,
        });
      }

      return { success: true, user };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Logout
   */
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user);
        } else {
          resolve(null);
        }
        unsubscribe();
      });
    });
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      await setDoc(doc(db, 'users', userId), updates, { merge: true });
      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
