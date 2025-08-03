

import Cookies from 'js-cookie';

const isProduction = import.meta.env.VITE_ENV === 'production';

const cookieOptions = {
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
};

/**
 * Sets auth cookies with an exact expiration timestamp.
 * @param {string} token - JWT token.
 * @param {Object} userData - User object.
 * @param {number} expiresAt - Timestamp in milliseconds.
 */
export const setAuthCookies = (token, userData, expiresAt) => {
  const expiresInDays = (expiresAt - Date.now()) / (1000 * 60 * 60 * 24);

  Cookies.set('authToken', token, {
    ...cookieOptions,
    expires: expiresInDays,
  });

  Cookies.set('userData', JSON.stringify(userData), {
    ...cookieOptions,
    expires: expiresInDays,
  });

  Cookies.set('expiresAt', expiresAt.toString(), {
    ...cookieOptions,
    expires: expiresInDays,
  });

 
};

export const setEditProfileUser = (user) => {
  Cookies.set("userData" , JSON.stringify(user))
}

/**
 * Clears all authentication-related cookies.
 */
export const removeAuthCookies = () => {
  Cookies.remove('authToken', { path: '/' });
  Cookies.remove('userData', { path: '/' });
  Cookies.remove('expiresAt', { path: '/' });
};

/**
 * Retrieves and validates auth cookies.
 * @returns {{ token: string, user: object, expiresAt: number } | null}
 */
export const getAuthFromCookies = () => {
  try {
    const token = Cookies.get('authToken');
    const userData = Cookies.get('userData');
    const expiresAt = parseInt(Cookies.get('expiresAt'), 10);

    if (token && userData && expiresAt && Date.now() < expiresAt) {
      return {
        token,
        user: JSON.parse(userData),
        expiresAt,
      };
    }
  } catch (error) {
    console.error('Error parsing auth cookies:', error);
  }

  removeAuthCookies(); // cleanup on failure or expired
  return null;
};
